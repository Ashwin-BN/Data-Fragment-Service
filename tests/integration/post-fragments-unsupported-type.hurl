# tests/integration/post-fragments-unsupported-type.hurl
# Posting an unsupported Content-Type produces a 415 error

POST http://localhost:8080/v1/fragments
Content-Type: text/invalid

[BasicAuth]
user1@email.com:password1

<note><body>This is an invalid fragment</body></note>

HTTP 415

[Asserts]

jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "Invalid Content-Type of request"
