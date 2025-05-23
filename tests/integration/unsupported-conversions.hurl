# 1. Try to create a CSV fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/csv

[BasicAuth]
user1@email.com:password1

file, file.csv;

HTTP 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/csv"
jsonpath "$.fragment.size" == 67

[Captures]
url: header "Location"

# 2. Try to get the data for the CSV fragment that we just created
GET {{url}}

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
body ==  ```
EmployeeID,Name,Department
001,Jack,IT
002,Mack,Sales
005,Lilly,HR
```


# 2. Try to convert the CSV fragment that we just created into a PNG fragment which is not supported by the API
GET {{url}}.png

[BasicAuth]
user1@email.com:password1

HTTP 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "Type conversion not possible. text/csv can only be converted into text/csv,text/plain,application/json."
