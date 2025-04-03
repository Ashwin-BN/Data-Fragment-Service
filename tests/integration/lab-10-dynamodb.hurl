# tests/integration/lab-10-dynamodb.hurl

# 1. create a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

{
  "service": "DynamoDB"
}

HTTP 201

[Asserts]
# Verify successful creation with proper headers and response format
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 28

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
fragment1_ownerId: jsonpath "$.fragment.ownerId"
fragment1_created: jsonpath "$.fragment.created"
fragment1_updated: jsonpath "$.fragment.updated"

# 2. Get the first fragment's metadata
GET {{fragment1_url}}/info

[BasicAuth]
user1@email.com:password1

HTTP 200
Content-Type: application/json; charset=utf-8
Content-Length: 259

[Asserts]
# Verify metadata matches captured values
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" == "{{fragment1_ownerId}}"
jsonpath "$.fragment.created" == "{{fragment1_created}}"
jsonpath "$.fragment.updated" == "{{fragment1_updated}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 28

# 3. Create a second fragment with Markdown content
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
user1@email.com:password1

`DynamoDB is **great**.`

HTTP 201

[Asserts]
# Verify successful creation with proper headers and response format
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
fragment2_ownerId: jsonpath "$.fragment.ownerId"
fragment2_created: jsonpath "$.fragment.created"
fragment2_updated: jsonpath "$.fragment.updated"

# 4. Get the second fragment's metadata
GET {{fragment2_url}}/info

[BasicAuth]
user1@email.com:password1

HTTP 200
Content-Type: application/json; charset=utf-8
Content-Length: 256

[Asserts]
# Verify metadata matches captured values
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" == "{{fragment2_ownerId}}"
jsonpath "$.fragment.created" == "{{fragment2_created}}"
jsonpath "$.fragment.updated" == "{{fragment2_updated}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

# 5. Get all fragments (ids only)
GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1

HTTP 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"

# Check if the fragments key is a list
jsonpath "$.fragments" isCollection

# Verify that the fragments list contains the IDs stored in variables fragment1_id and fragment2_id
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

# 6. Delete the first fragment
DELETE http://localhost:8080/v1/fragments/{{fragment1_id}}

[BasicAuth]
user1@email.com:password1

HTTP 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"

# 7. Verify fragment deletion
GET {{fragment1_url}}/info

[BasicAuth]
user1@email.com:password1

HTTP 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "The requested fragment doesn't exist."

# 8. Get all fragments again to verify deletion
GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1

HTTP 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"

# Check if the fragments key is a list
jsonpath "$.fragments" isCollection

# Confirm that the first id is NOT included but that the second id is
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"
