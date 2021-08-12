let data_url = 'data.csv';
let countriesArr = [],
    regionsArr = ['All'],
    tagsArr = [];
let mainTags = ["Information","Knowledge","Perception","Practice"];
let altTags = ["Social environment", "Structural factor"];

$(document).ready(function(){
    var data_all ;

    function getData(){
        Promise.all([
            d3.csv(data_url)
        ]).then(function(d){
            data_all = d[0]; 
            data_all.forEach(element => {
                // var href = '<a href="'+element['link']+'" target="blank">Link</a>';
                // element['link'] = href; 
                var arr = element['dimension'].split(",");
                var trimedArr = arr.map(x => x.trim());
                var formatedDims = "";
                trimedArr.forEach(d => {
                    mainTags.includes(d) ? formatedDims +='<label class="alert tag-main">'+d+'</label>' : formatedDims +='<label class="alert tag-alt">'+d+'</label>';
                });
                element['formattedDimension'] = formatedDims;
                var arr = element['insert_date'].split(" ");
                element['insert_date'] = arr[0];
            });
            console.log(data_all);

            d[0].forEach(element => {
                var pays = element['countries'].split(",");
                var dims = element['dimension'].split(",");
                var regs = element['region'].split(",");
                pays.forEach(p => {
                    countriesArr.includes(p.trim()) ? '' : countriesArr.push(p.trim());
                });
                dims.forEach(d => {
                    tagsArr.includes(d.trim()) ? '' : tagsArr.push(d.trim());
                });
                regs.forEach(r => {
                    regionsArr.includes(r.trim()) ? '' : regionsArr.push(r.trim());
                });
            });

            // 
            generateRegionSelect();

            // console.log("countries: " + countriesArr);
            // console.log("regions: " + regionsArr);
            var dtData = [];
            data_all.forEach(element => {
                dtData.push([element['source_id'],element['title'],element['formattedDimension'], element['region'],element['source_date'], element['organisation'],element['publication_channel']]);
            });
            console.log(dtData);
            var datatable = $('#datatable').DataTable({
                data : dtData,
                "columns": [
                    {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": '<i class="fa fa-plus-circle"></i>',
                        "width": "5%"
                    },
                    {"width": "25%"},
                    {"width": "15%"},
                    {"width": "15%"},
                    {"width": "5%"},
                    {"width": "10%"},
                    {"width": "5%"}
                ],
                "columnDefs": [
                    {
                        "className": "dt-head-left",
                        "targets": "_all"
                    },
                    { "searchable" : true, "targets": "_all"}
                ],
                // "scrollY": "600px", 
                // "scrollCollapse": true,
                // "paging": true,
                "pageLength": 20,
                "bLengthChange": false,
                "pagingType": "simple_numbers",
                "order":[[1, 'asc']],
                "dom": "lrtp",
                // "createdRow": function( row, data, dataIndex ) {
                //     // $(row).addClass('bgCol');
                //     // $('td', row).css({
                //     //     'border': '1px solid #ccc'
                //     //   }); 
                // }
            
            });


            $('#searchInput').keyup(function () {
                datatable.search($('#searchInput').val()).draw();
            });

            function format(arr){
                filtered = data_all.filter(function(d){ return d['source_id']==arr[0 ]});
                return '<table  class="tabDetail" >'+
                         '<tr>'+
                            '<td>&nbsp;</td>'+
                            '<td>&nbsp;</td>'+
                            '<td>&nbsp;</td>'+
                            '<td>'+
                                '<table class="tabDetail" >'+
                                    '<tr>'+
                                        // '<th rowspan="2"><strong>Geo</strong></th>'+
                                        '<th><strong>Geo</strong></th>'+
                                        '<td>Region</td>'+
                                        '<td>'+filtered[0]['region']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Countries ('+filtered[0]['country_count']+')</td>'+
                                        '<td>'+filtered[0]['countries']+'</td>'+
                                    '</tr>'+
                                
                                    '<tr>'+
                                        // '<th rowspan="3"><strong>Purpose</strong></th>'+
                                        '<th><strong>Purpose</strong></th>'+
                                        '<td>Summary</td>'+
                                        '<td>'+filtered[0]['details']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Indicators</td>'+
                                        '<td>'+filtered[0]['variables']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Target</td>'+
                                        '<td>'+filtered[0]['target_pop']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        // '<th rowspan="4"><strong>Method</strong></th>'+
                                        '<th><strong>Method</strong></th>'+
                                        '<td>Survey</td>'+
                                        '<td>'+filtered[0]['methodology']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Sample</td>'+
                                        '<td>'+filtered[0]['sample_type']+' - '+filtered[0]['sample_size']+' respondents</td>'+
                                        // '<td>'+filtered[0]['sample_size']+' respondents</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Review</td>'+
                                        '<td>'+filtered[0]['quality_check']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Comment</td>'+
                                        '<td>'+filtered[0]['source_comment']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        // '<th rowspan="3"><strong>Source</strong></th>'+
                                        '<th><strong>Source</strong></th>'+
                                        '<td>Data Type</td>'+
                                        '<td>'+filtered[0]['access_type']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Authors</td>'+
                                        '<td>'+filtered[0]['authors']+'</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td>&nbsp;</td>'+
                                        '<td>Publication</td>'+
                                        '<td><a href="'+filtered[0]['link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a></td>'+
                                        // '<td>'+filtered[0]['publication_channel']+'<a href="'+filtered[0]['link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a></td>'+
                                    '</tr>'+
                                
                                '</table>'+

                            '</td>'+
                            '<td>&nbsp;</td>'+
                        '</tr>'+
                        '</table>'

            };

            $('#datatable tbody').on('click', 'td.details-control', function(){
                // should change the icon to -
                var tr = $(this).closest('tr');
                var row = datatable.row(tr);
                // var td =  $(this).closest('tr')//row.find("td:nth-child(1)");

                if(row.child.isShown()){
                    row.child.hide();
                    tr.removeClass('shown');
                    tr.css('background-color', '#fff');
                    // console.log(row);
                }
                else {
                    row.child(format(row.data())).show();
                    tr.addClass('shown');
                    // console.log(row);
                    tr.css('background-color', '#f5f5f5');
                    tr.css('padding-bottom', '0');
                    // tr.css('border', 'none');
                    // td.css('padding-top', '0');
                    // tr.css('margin', '0');
                }
            });


        
            // generateKeyFigures();
        })
    
        
    } //getData

    getData();

    function updateTable(dataArg){
        var arr = (dataArg == undefined ? data_all : dataArg);
        var dt = [];
        arr.forEach(element => {
            dt.push([element['source_id'],element['title'],element['formattedDimension'], element['region'],element['source_date'], element['organisation'],element['publication_channel']]);
        });
        $('#datatable').dataTable().fnClearTable();
        $('#datatable').dataTable().fnAddData(dt);
    }

    function generateKeyFigures(){
        $('#keyFigs').html("");

    }

    function generateRegionSelect(){
        var options = '';
        for (let i = 0; i < regionsArr.length; i++) {
        i == 0 ? options += '<option value="' + regionsArr[i] + '" selected>' + regionsArr[i] + '</option>' :
            options += '<option value="' + regionsArr[i] + '">' + regionsArr[i] + '</option>';
        }
        $('#regionSelect').html(options);
    } //generateRegionSelect

    function createButtons(){
        var html = "";
        for (let tagsArr = 0; tagsArr < array.length; tagsArr++) {
            const element = array[tagsArr];
            
        }
        $('#container').append(html);
    }

    var buttons = document.getElementsByClassName("btn-info");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", clickButton);
    }

    function clickButton() {
        var val = this.value;
        // $(this).removeClass('active');

        if (val == "all") {
            updateTable();
        } else {
            var filter = data_all.filter(function(d) {
                var arr = d['dimension'].split(",");
                var trimedArr = arr.map(x => x.trim());
                return (trimedArr.includes(val) ? d : null);
            })
            updateTable(filter);
        }
        
    } //clickButton

    $('#regionSelect').on('change', function(){
        var regionSelected = $('#regionSelect').val();
        console.log("region selected: " +regionSelected);

        if (regionSelected == "All") {
            updateTable();
        } else {
            var filter = data_all.filter(function(d) {
                var arr = d['region'].split(",");
                var trimedArr = arr.map(x => x.trim());
                return (trimedArr.includes(regionSelected) ? d : null);
            });

            updateTable(filter);
        }

    });



})

