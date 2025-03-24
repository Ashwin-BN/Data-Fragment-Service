# tests/integration/401.hurl
# HTTP 404 response check

GET http://localhost:8080/no-route

HTTP 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "not found"
