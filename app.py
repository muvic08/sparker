#!/usr/bin/env python

"""
Authentication, error handling, etc
"""

import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import uuid
import pymongo
from pymongo import Connection, GEO2D
from bson.son import SON
import json
from bson.objectid import ObjectId
from bson import json_util
import math
import sparker

from tornado.options import define, options

from fbauth import LoginHandler, LogoutHandler, AuthHandler, BaseHandler

define("port", default=8000, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            (r"/chatsocket", ChatSocketHandler),
            (r'/auth/login', AuthHandler),
            (r'/auth/logout', LogoutHandler)
        ]
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["sparker_collections"]
        self.db.sparks.create_index([("location", GEO2D)])
        self.db.user_locations.create_index([("location", GEO2D)])
        self.db.user_locations.remove()

        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False,
            autoescape=None,
            facebook_api_key='285475164916234',
            facebook_secret='788fe59f10d5dda5738cffc27391c5d3',
            login_url="/auth/login",
        )
        tornado.web.Application.__init__(self, handlers, **settings)


class MainHandler(BaseHandler): # , 
    @tornado.web.authenticated
    def get(self):
        self.render("sparker.html")

class ChatSocketHandler(tornado.websocket.WebSocketHandler, BaseHandler):
    #waiters = set()
    waiters = {}
    def allow_draft76(self):
        # for iOS 5.0 Safari
        return True

    def open(self):
        ChatSocketHandler.cache = []
        if self.current_user not in ChatSocketHandler.waiters.keys():
            ChatSocketHandler.waiters[self.current_user] = [self]
        else:
            ChatSocketHandler.waiters[self.current_user].append(self)

    def on_close(self):
        ChatSocketHandler.waiters[self.current_user].remove(self)
        sockets = ChatSocketHandler.waiters[self.current_user]
        if len(sockets) == 0:
            self.application.db.user_locations.remove({"username": self.current_user})
            print "User removed"
    def on_ping(self):
        print 'I was pinged'

    def on_pong(self):
        print 'I was ponged'

    def on_message(self, message):
        parsed_msg = tornado.escape.json_decode(message)
        location = parsed_msg['location']
        if parsed_msg["INTENT"] == "SET_USER_LOCATION": # location received or updated
            sparker.register_user_location(self.application.db, self.current_user, location)
            sparks = sparker.messages_near(self.application.db, location)
            self.write_message( json.dumps(sparker.messages_near(self.application.db, location)) ) 
            

        elif parsed_msg["INTENT"] == "SPARK": # new spark received
            del parsed_msg["_xsrf"]
            del parsed_msg["INTENT"]
            _id = ObjectId()
            parsed_msg['_id'] = _id
            parsed_msg['datetime_created'] = str(_id.generation_time)
            parsed_msg['votes'] = 0
            parsed_msg['owner_id'] = self.application.db.user_locations.find_one({"username": self.current_user})["username"]

            self.application.db.sparks.save(parsed_msg)
            message_out = json.dumps(parsed_msg, default=sparker.encode_doc)
            interested_users = sparker.get_users_near(self.application.db, location)
            for user in interested_users:
                for socket in ChatSocketHandler.waiters[user['username']]:
                    socket.write_message(message_out)


        elif parsed_msg["INTENT"] == "UP_OR_DOWN_VOTE": # up or down vote
            up_or_down_vote = parsed_msg["vote"]
            #del parsed_msg["INTENT"]
            if up_or_down_vote == 1 or up_or_down_vote == -1 and int(parsed_msg["votes"]) >= 1:
                sparker.vote(self.application.db.sparks, self.current_user, parsed_msg["_id"], up_or_down_vote, int(parsed_msg["votes"]))
                parsed_msg["votes"] = parsed_msg["votes"] + up_or_down_vote
            interested_users = sparker.get_users_near(self.application.db, location)
            message_out = json.dumps(parsed_msg, default=sparker.encode_doc)
            for user in interested_users:
                for socket in ChatSocketHandler.waiters[user['username']]:
                    socket.write_message(message_out)
            


def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
