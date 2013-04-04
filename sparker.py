from bson.objectid import ObjectId
import json
import tornado.escape

def spark_dict(spark, render_spark):
    spark_id = spark["_id"]
    objectid = str(spark_id)
    time = str(spark_id.generation_time)
    json_objectid = str(tornado.escape.json_decode(json.dumps(objectid)))
    json_time = str(tornado.escape.json_decode(json.dumps(time)))
    del spark["_id"]
    spark["_id"] = json_objectid
    spark["time_posted"] = json_time
    spark["body"] = tornado.escape.linkify(spark["body"])
    render_spark(spark)

def get_users_near(db, location):
    return db.user_locations.find({"location": {"$near": location}}, {"username": 1})

def messages_near(db, location):
    sparks = []
    for spark in db.sparks.find({"location": {"$within": {"$center": [location, 200/6378.137]}}}):
        def render_spark(spark):
            sparks.append(spark)
        spark_dict(spark, render_spark)
    return sparks

def save_new_message(db, message):
    pass
    #print message

def encode_doc(obj):
    return obj.__str__()

def vote(coll, username, message_id, up_or_down_vote, votes):
    coll.update({"_id": ObjectId(message_id) }, { "$inc": { "votes": up_or_down_vote } }) 

def register_user_location(db, username, location):
    db.user_locations.update({"username": username}, {"$set": {"location": location}}, upsert=True)