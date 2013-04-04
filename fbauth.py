import tornado.web
import tornado.auth





class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        user_json = self.get_secure_cookie("user")
        if user_json:
        	user_info = tornado.escape.json_decode(user_json)
        	print user_info
        	return user_info["name"]
        else: 
        	return None


class AuthHandler(BaseHandler, tornado.auth.GoogleMixin):
    @tornado.web.asynchronous
    def get(self):
        if self.get_argument("openid.mode", None):
            self.get_authenticated_user(self.async_callback(self._on_auth))
            return
        self.authenticate_redirect()
 
    def _on_auth(self, user):
        if not user:
            self.send_error(500)
        self.set_secure_cookie("user", tornado.escape.json_encode(user))
        self.redirect("/")




class FacebookHandler(tornado.web.RequestHandler,
                      tornado.auth.FacebookMixin):
    @tornado.web.asynchronous
    def get(self):
        if self.get_argument("session", None):
            self.get_authenticated_user(self.async_callback(self._on_auth))
            return
        self.authenticate_redirect()

    def _on_auth(self, user):
        if not user:
            raise tornado.web.HTTPError(500, "Facebook auth failed")
        # Save the user using, e.g., set_secure_cookie()



class LoginHandler(tornado.web.RequestHandler, tornado.auth.FacebookGraphMixin):
	@tornado.web.asynchronous
	def get(self):
		userID = self.get_secure_cookie('user_id')
		if self.get_argument('code', None):
			self.get_authenticated_user(
				redirect_uri='http://example.com/auth/login',
				client_id=self.settings['facebook_api_key'],
				client_secret=self.settings['facebook_secret'],
				code=self.get_argument('code'),
				callback=self.async_callback(self._on_facebook_login))
			return
		elif self.get_secure_cookie('access_token'):
			self.redirect('/')
			return
		self.authorize_redirect(
			redirect_uri='http://localhost/auth/login',
			client_id=self.settings['facebook_api_key'],
			extra_params={'scope': 'read_stream'}
		)

	def _on_facebook_login(self, user):
		if not user:
			self.clear_all_cookies()
			raise tornado.web.HTTPError(500, 'Facebook authentication failed')
		self.set_secure_cookie('user_id', str(user['id']))
		self.set_secure_cookie('user_name', str(user['name']))
		self.set_secure_cookie('access_token', str(user['access_token']))
		self.redirect('/')

class LogoutHandler(tornado.web.RequestHandler):
	def get(self):
		self.clear_all_cookies()
		self.render('logout.html')