let data_url = 'data.csv';


$(document).ready(function(){
    var data ;

    function getData(){
        Promise.all([
            d3.csv(data_url)
        ]).then(function(d){
            data = d[0];
            console.log(data);

            var dtData = [];
            data.forEach(element => {
                dtData.push([element['source_id'],element['title'], element['organisation'],element['insert_date'],element['sample'], "count", element['publication_channel'], element['scale'], element['link']]);
            });
            // console.log(dtData);
            var table = $('#datatable').DataTable({
                data : dtData,
                "columns": [
                    {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": '<i class="fa fa-plus-circle"></i>'
                    },
                    {"width": '200px'},
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                ],
                // fixedColumns: true,
                "order":[[1, 'asc']],
                "bFilter" : false,
                "bLengthChange" : false,
                "pageLength": 20,
                dom: 'Bfrtip'
            });

            function format(arr){
                filtered = data.filter(function(d){ return d['source_id']==arr[0 ]});
                console.log(filtered);
                return '<table cellpadding="5" cellspacing="10" class="tabDetail">'+
                 '<tr>'+
                    '<td>&nbsp;</td>'+
                    '<td>&nbsp;</td>'+
                    '<td>&nbsp;</td>'+
                    '<td colspan="5">'+
                        '<div class="inner"><h6>Authors</h6>'+filtered[0]['authors']+'</div>'+
                        '<div class="inner"><h6>Details</h6>'+filtered[0]['details']+'</div>'+
                        '<div class="inner"><h6>Methodology</h6>'+filtered[0]['methodology']+'</div>'+
                        '<div class="inner"><h6>Sample Type</h6>'+filtered[0]['sample type']+'</div>'+
                        '<div class="inner"><h6>Quality Check</h6>'+filtered[0]['quality_check']+'</div>'+
                        '<div class="inner"><h6>Target Population</h6>'+filtered[0]['access_type']+'</div>'+
                        '<div class="inner"><h6>Source Comment</h6>'+filtered[0]['source_comment']+'</div>'+
                        '<div class="inner"><h6>Indicators</h6>'+filtered[0]['access_type']+'</div>'+
                        '<div class="inner"><h6>Countries</h6>'+filtered[0]['access_type']+'</div>'+
                        '<div class="inner"><h6>Region</h6>'+filtered[0]['access_type']+'</div>'+
                    '</td>'+
                '</tr>'+
                '</table>';

            };

            $('#datatable tbody').on('click', 'td.details-control', function(){
                var tr = $(this).closest('tr');
                var row = table.row(tr);

                if(row.child.isShown()){
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    row.child(format(row.data())).show();
                    tr.addClass('shown');
                }
            })

        })
    
        
    } //getData

    getData();



})

