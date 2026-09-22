"""Small HTTP adapter for the local Laya decision engine."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from laya import Router


router = Router(preload=True)


class LayaHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/predict":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            result = router.predict(payload["state"], payload["questions"])
            body = json.dumps(result).encode("utf-8")
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            self.send_error(400, str(error))
            return
        except Exception as error:
            self.send_error(500, str(error))
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8000), LayaHandler).serve_forever()
