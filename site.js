let data_url = 'data.csv';
let geoDataUrl = 'world.json';
let geomData;

let countriesArr = [],
    regionsArr = [],
    tagsArr = [];
let mainTags = ["Information","Knowledge","Perception","Practice"];
let altTags = ["Social environment", "Structural factor"];

let new_studies = 0;
let comparisonDate_start = new Date();
let comparisonDate_end = new Date();
let latestUpdateDate,
    latestUpdateDateArr = [];
comparisonDate_start.setMonth(comparisonDate_end.getMonth() - 2);
comparisonDate_start.setDate(1);

let g,
    mapsvg;

let mapFillColor = '#9EC8AE', 
    mapInactive = '#C2C4C6',
    mapActive = '#2F9C67',
    hoverColor = '#78B794';

let mapCountryClicked = 'all';

$(document).ready(function(){
    var data_all ;

    function getData(){
        Promise.all([
            d3.csv(data_url),
            d3.json(geoDataUrl)
        ]).then(function(d){
            data_all = d[0]; 
            geomData = topojson.feature(d[1], d[1].objects.world);
            data_all.forEach(element => {
                // var href = '<a href="'+element['link']+'" target="blank">Link</a>';
                // element['link'] = href; 
                var arr1 = element['dimension'].split(",");
                var trimedArr = arr1.map(x => x.trim());
                var formatedDims = "";
                trimedArr.forEach(d => {
                    mainTags.includes(d) ? formatedDims +='<label class="alert tag-main">'+d+'</label>' : formatedDims +='<label class="alert tag-alt">'+d+'</label>';
                });
                element['formattedDimension'] = formatedDims;

                var arr = new Date(element['source_date']);//element['source_date'].split(" ");
                element['date'] = element['source_date'];

                arr <= comparisonDate_end && arr >= comparisonDate_start ? new_studies +=1 : null; 
                var updateDate = new Date(element['insert_date']);
                latestUpdateDateArr.includes(updateDate) ? null : latestUpdateDateArr.push(updateDate);
            });
            latestUpdateDate = d3.max(latestUpdateDateArr);

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
            $('#lastUpdate span').text(latestUpdateDate.toDateString())
            generateRegionSelect();
            generateKeyFigures();
            initiateMap();

            var dtData = [];
            data_all.forEach(element => {
                dtData.push([element['source_id'],element['title'],
                                element['formattedDimension'], 
                                element['region'],
                                element['date'], 
                                element['organisation'],
                                '<a href="'+element['link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a>',
                                //hidden
                                element['details'],element['authors'],element['countries'],
                                element['variables'],element['source_comment'],element['methodology'],
                                element['target_pop'], element['sample_type'],element['quality_check']
                            ]);
            });
            // console.log(dtData);
            $.fn.dataTableExt.oSort["myDate-desc"] = function(x, y) {
                var fX = new Date(x),
                    fY = new Date(y);

                    if (fX > fY) {
                        return -1;
                    }

                    return 1;
            };
            $.fn.dataTableExt.oSort["myDate-asc"] = function(x, y) {
                var fX = new Date(x),
                    fY = new Date(y);
                    
                    if (fX > fY) {
                        return 1;
                    }

                    return -1;
            };
            var datatable = $('#datatable').DataTable({
                data : dtData,
                "columns": [
                    {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": '<i class="fa fa-plus-circle"></i>',
                        "width": "1%"
                    },
                    {"width": "25%"},
                    {"width": "15%"},
                    {"width": "15%"},
                    {"width": "5%"},
                    {"width": "10%"},
                    {"width": "1%"}
                ],
                "columnDefs": [
                    {
                        "className": "dt-head-left",
                        "targets": "_all"
                    },
                    {
                        "defaultContent": "-",
                        "targets": "_all"
                    },
                    {"targets": [7], "visible": false},{"targets": [8], "visible": false},{"targets": [9], "visible": false},
                    {"targets": [10], "visible": false},{"targets": [11], "visible": false},{"targets": [12], "visible": false},
                    {"targets": [13], "visible": false},{"targets": [14], "visible": false},{"targets": [15], "visible": false},
                    { "searchable" : true, "targets": "_all"},
                    {"type": "myDate","targets": 4}
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
                            '<td>&nbsp;</td>'+'<td>&nbsp;</td>'+
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
                                        // '<td><a href="'+filtered[0]['link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a></td>'+
                                        '<td>'+filtered[0]['publication_channel']+'</td>'+
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
                // var rowUp=document.getElementByClassName("shown");
                // var nextRow = rowUp.parentNode.rows[ rowUp.rowIndex + 1 ];
            });


        
            // generateKeyFigures();
        })
    
        
    } //getData

    getData();

    function updateTable(dataArg){
        var arr = (dataArg == undefined ? data_all : dataArg);
        var dt = [];
        arr.forEach(element => {
            dt.push([element['source_id'],element['title'],
                element['formattedDimension'],
                element['region'],
                element['date'],
                element['organisation'],
                '<a href="'+element['link']+'" target="blank"><i class="fa fa-download fa-sm"></i></a>',
                //hidden
                element['details'],element['authors'],element['countries'],
                element['variables'],element['source_comment'],element['methodology'],
                element['target_pop'], element['sample_type'],element['quality_check']
            ]);
        });
        $('#datatable').dataTable().fnClearTable();
        $('#datatable').dataTable().fnAddData(dt);
    }

    function generateKeyFigures(){
        $('#studies h2').text(data_all.length);
        $('#countries h2').text(countriesArr.length);
        $('#new_studies h2').text(new_studies);
    } //generateKeyFigures

    function generateRegionSelect(){
        var options = '';
        for (let i = 0; i < regionsArr.length; i++) {
            options += '<option value="' + regionsArr[i] + '">' + regionsArr[i] + '</option>';
        }
        $('#regionSelect').append(options);
    } //generateRegionSelect

    function createButtons(){
        var html = "";
        for (let tagsArr = 0; tagsArr < array.length; tagsArr++) {
            const element = array[tagsArr];
            
        }
        $('#container').append(html);
    }

    var buttons = document.getElementsByClassName("btn");
    for (var i = 0; i < buttons.length; i++) {
        d3.select('#'+buttons[i].id).append('div').attr('class', 'd3-tip tag-tip hidden');
        buttons[i].addEventListener("click", clickButton);        
    }

    $('.btn').mouseenter(function(){
        var text = "Reset all filters";
        this.id == "tagInfo" ? text = "Refers to ..." :
        this.id == "tagKnowledge" ? text = "Refers to ..." :
        this.id == "tagPerception" ? text = "Refers to ..." :
        this.id == "tagPractice" ? text = "Refers to ..." :
        this.id == "tagFactor" ? text = "Refers to ..." : 
        this.id == "tagEnv" ? text = "Refers to ..." : null;

        // var mouse = d3.mouse();
        // console.log(mouse[0]);
        d3.select('#'+this.id).selectAll('div')
        .text(text)
        .classed('hidden', false)
        .attr('style', function(d){
            console.log(d);
        })
    })
    $('.btn').mouseleave(function(){
        d3.select('#'+this.id).selectAll('div')
        .classed('hidden', true);
    })


    function clickButton() {    
        $('.btn').removeClass('active');
        
        var val = this.value;
        var regionSelected = $('#regionSelect').val();
        var data = data_all;
        if (mapCountryClicked != 'all') {
            data = data.filter(function(item){
                var arr = item['countries'].split(",");
                var trimedArr = arr.map(x => x.trim());
                return trimedArr.includes(mapCountryClicked) ? item : null;
            })
        }

        if (val == "all") {
            updateTable();
            regionSelected == 'all' ? null : $('#regionSelect').val('all');
            mapCountryClicked = 'all';
            // remove map filter too
            mapsvg.selectAll('path').each(function(element, index){
                if (d3.select(this).classed('clicked')) {
                    d3.select(this).attr('fill', mapFillColor); 
                }
            });
        } else {
            var filter = data.filter(function(d) {
                var arr = d['dimension'].split(",");
                var regArr = d['region'].split(",");
                var trimedTagArr = arr.map(x => x.trim());
                var trimedRegArr = regArr.map(x => x.trim());
                var trimedArr = arr.map(x => x.trim());
                regionSelected == 'all' ? trimedRegArr = "all" : null;
                return ( trimedTagArr.includes(val) && trimedRegArr.includes(regionSelected)) ? d : null;
            })
            updateTable(filter);
        }

        $(this).toggleClass('active');
        
    } //clickButton

    $('#regionSelect').on('change', function(){
        var tagsFilter = 'all';
        var data = data_all;
        if (mapCountryClicked != 'all') {
            data = data.filter(function(item){
                var arr = item['countries'].split(",");
                var trimedArr = arr.map(x => x.trim());
                return trimedArr.includes(mapCountryClicked) ? item : null;
            })
        }

        for (var i = 0; i < buttons.length; i++) {
            if ($(buttons[i]).hasClass('active')) {
                tagsFilter = $(buttons[i]).val();
            }
            
        }
        var regionSelected = $('#regionSelect').val();

        if (regionSelected == "all") {
            tagsFilter == 'all' ? updateTable() : $('.active').trigger('click');
        } else {
                var filter = data.filter(function(d) {
                var arr = d['dimension'].split(",");
                var regArr = d['region'].split(",");
                var trimedTagArr = arr.map(x => x.trim());
                var trimedRegArr = regArr.map(x => x.trim());
                tagsFilter == 'all' ? trimedTagArr = "all" : null; //this for the condition to be always true
                return (trimedRegArr.includes(regionSelected) && trimedTagArr.includes(tagsFilter) ) ? d : null;
            });
            updateTable(filter);
        }

    });

    function initiateMap() {
        var width = $('#map').width();
        var height = 550;
        var mapScale = width/12;
        var mapCenter = [25, 25];
    
        projection = d3.geoMercator()
          .center(mapCenter)
          .scale(mapScale)
          .translate([width / 2, height / 2]);
    
        var path = d3.geoPath().projection(projection);
    
        mapsvg = d3.select('#map').append("svg")
            .attr("width", width)
            .attr("height", height);
    
    
        g = mapsvg.append("g").attr('id', 'admin')
              .selectAll("path")
              .data(geomData.features)
              .enter()
                .append("path")
                .attr('d',path)
                .attr('id', function(d){ 
                    return d.properties.ISO_A3; 
                })
                .attr('class', function(d){
                    var className = (countriesArr.includes(d.properties.ADMIN)) ? 'hasStudy' : 'inactive';
                    return className;
                })
                .attr('fill', function(d){
                    return countriesArr.includes(d.properties.ADMIN) ? mapFillColor : mapInactive ;
                })
                .attr('stroke-width', .2)
                .attr('stroke', '#fff');
                
        //map tooltips
        var maptip = d3.select('#map').append('div').attr('class', 'd3-tip map-tip hidden');

        g.filter('.hasStudy')
            .on('mousemove', function(d,i) {
                if ( !$(this).hasClass('clicked')) {
                    $(this).attr('fill', hoverColor);
                }
                var mouse = d3.mouse(mapsvg.node()).map( function(d) { return parseInt(d); } );
                maptip
                    .classed('hidden', false)
                    .attr('style', 'left:'+(mouse[0])+'px; top:'+(mouse[1]+100)+'px')
                    .html(d.properties.ADMIN)
            })
            .on('mouseout',  function(d,i) {

                if ( !$(this).hasClass('clicked')) {
                    $(this).attr('fill', mapFillColor);
                }
                maptip.classed('hidden', true);
            })
            .on('click', function(d,i){
                mapCountryClicked = d.properties.ADMIN;
                mapCountrySelected($(this), d.properties.ADMIN);
            });
    
    
      } //initiateMap

      function mapCountrySelected(pays, name){
        pays.removeClass('clicked')

        pays.siblings('.hasStudy').attr('fill', mapFillColor);
        pays.attr('fill', mapActive);
        pays.addClass('clicked');

        var filter = data_all.filter(function(d) {
            var arr = d['countries'].split(",");
            var trimedPaysArr = arr.map(x => x.trim());
            return (trimedPaysArr.includes(name)) ? d : null;
        });
        updateTable(filter);
        //clear tag selection and region dropdown select to all
        $('.btn').removeClass('active');
        $('.all').toggleClass('active');
        $('#regionSelect').val('all');


      } //mapcountrySelected



})



// TO DO 
// Sample : format number respondents