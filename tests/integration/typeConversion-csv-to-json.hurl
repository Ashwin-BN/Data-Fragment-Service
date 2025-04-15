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

# 2. Try to convert the CSV fragment that we just created into a JSON fragment
GET {{url}}.json

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
body == ```
[
  {
    "EmployeeID": "001",
    "Name": "Jack",
    "Department": "IT"
  },
  {
    "EmployeeID": "002",
    "Name": "Mack",
    "Department": "Sales"
  },
  {
    "EmployeeID": "005",
    "Name": "Lilly",
    "Department": "HR"
  }
]```
