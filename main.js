(function (angular, document, name) {
  'use strict';

  angular
    .module(name, [
      'ngAnimate',
      'ngTouch',
      'cgBusy',
      'ui.grid',
      'ui.grid.pagination'
    ])
    .constant('SHEETS_API_CODE', '1RkmvojZgrGa4Jd8Tq76gxZb1vbiYnJHLyN0NzYvl-0Y')
    .controller('BookController', BookController);

  function BookController($scope, $http, SHEETS_API_CODE) {
    var vm = this;
    //$http.defaults.headers.common['GData-Version'] = '3.0';
    vm.tablePagination = {pageNumber: 1, pageSize: 100, sortColumn: null, sortDirection: null, searchQuery: ''};

    vm.tableOptions = {
      data: [],
      enableColumnMenus: false,
      enableFiltering: false,
      paginationPageSizes: [50, 100, 200],
      paginationPageSize: 50,
      enableHorizontalScrollbar: false,
      useExternalPagination: true,
      useExternalSorting: true,
      columnDefs: [
        {field: 'gsx$number.$t', type: 'number', name: 'number', displayName: 'Інвентарний №'},
        {field: 'gsx$author.$t', type: 'string', name: 'author', displayName: 'Автор'},
        {field: 'gsx$title.$t', type: 'string', name: 'title', displayName: 'Назва'},
        {field: 'gsx$publisher.$t', type: 'string', name: 'publisher', displayName: 'Видавництво'},
        {field: 'gsx$published.$t', type: 'number', name: 'published', displayName: 'Рік видання'}
      ],
      onRegisterApi: onRegisterApi
    };
    vm.busyOptions = {promise: null, message: 'Зачекайте...'};
    vm.search = search;

    search();

    function onRegisterApi(gridApi) {
      gridApi.core.on.sortChanged($scope, sortChanged);
      gridApi.pagination.on.paginationChanged($scope, paginationChanged);
    }

    function sortChanged(grid, sortColumns) {
      var sortColumn = sortColumns[0];
      vm.tablePagination.sortColumn = sortColumn.name;
      vm.tablePagination.sortDirection = sortColumn.sort.direction;
      search();
    }

    function paginationChanged(newPage, pageSize) {
      vm.tablePagination.pageNumber = newPage;
      vm.tablePagination.pageSize = pageSize;
      search();
    }

    function search() {
      getPage(vm.tablePagination);
    }

    function getPage(options) {
      var query = 'https://spreadsheets.google.com/feeds/list/' + SHEETS_API_CODE + '/od6/public/full?alt=json';
      query += '&max-results=' + options.pageSize;
      query += '&start-index=' + ((options.pageNumber - 1) * options.pageSize + 1);

      if (options.sortColumn && options.sortDirection) {
        query += '&orderby=column:' + options.sortColumn;
        query += '&reverse=' + (options.sortDirection !== 'asc');
      }

      if (vm.tablePagination.searchQuery) {
        query += '&q=' + vm.tablePagination.searchQuery.replaceAll(' ', '+');
      }

      vm.busyOptions.promise = $http
        .get(query)
        .then(function (result) {
          var feed = result.data.feed;
          vm.tableOptions.totalItems = feed.openSearch$totalResults.$t;
          vm.tableOptions.data = feed.entry;
        });
    }
  }

  String.prototype.replaceAll = function(search, replace){
    return this.split(search).join(replace);
  };

  angular.element(document).ready(function () {
    angular.bootstrap(document, [name]);
  });
})(angular, document, 'book-reader.runner');
