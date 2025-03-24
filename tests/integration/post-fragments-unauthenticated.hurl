# tests/integration/post-fragments-authenticated.hurl
# Confirm that posting a fragment without authentication returns 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`Test fragment content`

HTTP 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
