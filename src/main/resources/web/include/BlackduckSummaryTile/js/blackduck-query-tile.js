'use strict';

(function () {

    var BlackduckQueryTileViewController = function ($scope, BlackduckQueryService, XlrTileHelper) {
        var vm = this;

        vm.tileConfigurationIsPopulated = tileConfigurationIsPopulated;

        var tile;

        if ($scope.xlrDashboard) {
            // summary page
            vm.release = $scope.xlrDashboard.release;
            vm.tile = $scope.xlrTile.tile;
            if (vm.tile.properties == null) {
                vm.config = vm.tile.configurationProperties;
            } else {
                // new style since 7.0
                vm.config = vm.tile.properties;
            }
        }

        function tileConfigurationIsPopulated() {
            return !_.isEmpty(vm.config.blackduckServer);
        }

        function load(config) {
            if (tileConfigurationIsPopulated()) {
                vm.loading = true;
                BlackduckQueryService.executeQuery(vm.tile.id, config).then(
                    function (response) {
                        var blackduckdata = response.data.data;
                        var result = new Object();
                        for (var metric = 0 ; metric < Object.getOwnPropertyNames(blackduckdata).length ; metric++)
                        {
                            var keyName = Object.getOwnPropertyNames(blackduckdata)[metric];
                            var finalKeyName = vm.config.metrics.value[keyName];
                            switch(keyName){
                                case 'key' : result[keyName] = { key : 'Project Key', value : blackduckdata[keyName], url : blackduckdata['blackduckUrl'] + '/overview?id=' + blackduckdata['key']}; break;
                                case 'version' : result[keyName] = { key : 'Arfifact Version', value : blackduckdata[keyName]}; break;
                                case 'name' : break;
                                case 'id' : break;
                                case 'blackduckUrl' : break;
                                default : result[keyName] = { key : finalKeyName, value : blackduckdata[keyName], url : blackduckdata['blackduckUrl'] + '/component_measures/metric/' + keyName + '/list?id=' + blackduckdata['key']};

                            }
                            
                        }
                        vm.result = result;
                        $scope.xlrTile.title = tile.title + " : " + blackduckdata['name'];
                    }
                ).finally(function () {
                    vm.loading = false;

                });
            }
        }


        function refresh() {
            load({params: {refresh: true}});
        }

        load();

        vm.refresh = refresh;
    };

    BlackduckQueryTileViewController.$inject = ['$scope', 'xlrelease.blackduck.BlackduckQueryService', 'XlrTileHelper'];

    var BlackduckQueryService = function (Backend) {

        function executeQuery(tileId, config) {
            return Backend.get("tiles/" + tileId + "/data", config);
        }

        return {
            executeQuery: executeQuery
        };
    };

    BlackduckQueryService.$inject = ['Backend'];

    angular.module('xlrelease.blackduck.tile', []);
    angular.module('xlrelease.blackduck.tile').service('xlrelease.blackduck.BlackduckQueryService', BlackduckQueryService);
    angular.module('xlrelease.blackduck.tile').controller('blackduck.BlackduckQueryTileViewController', BlackduckQueryTileViewController);

})();

