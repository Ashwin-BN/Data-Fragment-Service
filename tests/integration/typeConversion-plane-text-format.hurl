# 1. Create a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

file, file.json;

HTTP 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
jsonUrl: header "Location"

# 2. Convert JSON to plain text
GET {{jsonUrl}}.txt

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == ```
{
  "key1": "ABC",
  "key2": "DEF",
  "key3": "XYZ"
}```

# 3. Create a YAML fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/yaml

[BasicAuth]
user1@email.com:password1

file, file.yaml;

HTTP 201

[Asserts]
jsonpath "$.fragment.type" == "application/yaml"

[Captures]
yamlUrl: header "Location"

# 4. Convert YAML to plain text
GET {{yamlUrl}}.txt

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == ```
[
  {
    "app": {
      "name": "jack",
      "job": "teacher"
    }
  }
]```

# 5. Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
user1@email.com:password1

file, file.md;

HTTP 201

[Captures]
mdUrl: header "Location"

# 6. Convert Markdown to plain text
GET {{mdUrl}}.txt

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == ```
# Hello World! This is a markdown file
```

# 7. Create an HTML fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/html

[BasicAuth]
user1@email.com:password1

file, file.html;

HTTP 201

[Captures]
htmlUrl: header "Location"

# 8. Convert HTML to plain text
GET {{htmlUrl}}.txt

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == ```
<h1>Hello World! This is an HTML file</h1>
```

# 9. Create a CSV fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/csv

[BasicAuth]
user1@email.com:password1

file, file.csv;
HTTP 201

[Captures]
csvUrl: header "Location"

# 10. Convert CSV to plain text
GET {{csvUrl}}.txt

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == ```
EmployeeID,Name,Department
001,Jack,IT
002,Mack,Sales
005,Lilly,HR
```
