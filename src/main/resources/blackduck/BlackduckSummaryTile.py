
import json
from xlrelease.HttpRequest import HttpRequest

if not blackduckServer:
    raise Exception("Blackduck server ID must be provided")

blackduck_url = blackduckServer['url']
blackduck_server_api_url = '/api/measures/component?componentKey=%s&metricKeys=%s' % (resource, ','.join(metrics.keys()))
http_request = HttpRequest(blackduckServer)
blackduck_response = http_request.get(blackduck_server_api_url)
if blackduck_response.isSuccessful():
    json_data = json.loads(blackduck_response.getResponse())
    data1 = {}
    data1['id'] = json_data['component']['id']
    data1['key'] = json_data['component']['key']
    data1['name'] = json_data['component']['name']
    data1['blackduckUrl'] = blackduck_url
    for item in json_data['component']['measures']:
        data1[item['metric']] = item['value']
    data = data1
else:
    error = json.loads(blackduck_response.getResponse())
    if 'Invalid table' in error['error']['message']:
        print "Invalid Table Name"
        data = {"Invalid table name"}
        blackduck_response.errorDump()
    else:
        print "Failed to run query in Blackduck"
        blackduck_response.errorDump()
    sys.exit(1)
