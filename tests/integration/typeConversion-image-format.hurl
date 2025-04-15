# 1. Create a PNG image fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png

[BasicAuth]
user1@email.com:password1

file, file.png;

HTTP 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"
jsonpath "$.fragment.size" > 0

[Captures]
url: header "Location"

# 2. Get original PNG
GET {{url}}

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/png"
file, file.png;

# 3. Convert to JPEG
GET {{url}}.jpg

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/jpeg"
header "Content-Length" == "176889"

# 4. Convert to WEBP
GET {{url}}.webp

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/webp"
header "Content-Length" == "177132"

# 5. Convert to GIF
GET {{url}}.gif

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/gif"
header "Content-Length" == "592250"

# 6. Convert to AVIF
GET {{url}}.avif

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/avif"
header "Content-Length" == "100044"
