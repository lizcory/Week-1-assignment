//Define constants
const margin = {t: 50, r:50, b: 50, l: 50};
const size = {w: 800, h: 800};
const svg = d3.select('svg');

//Create svg
svg.attr('width', size.w)
    .attr('height', size.h);


Promise.all([
    d3.json('data/maps/us-counties.geo.json'),
    d3.csv('data/mort_subset_v2.csv')
]).then(function (datasets) {

    console.log(datasets);
    let mapData = datasets[0];
    let mortData = datasets[1];

    let mapG = svg.append('g')
        .classed('map',true);

    drawMap(mapG, mapData);  //  load map data

    return(mortData);
    
});


// draw the regions of the map
function drawMap (mapG, mapData) {

    // create projection function
    let projection = d3.geoAlbersUsa()
        .fitSize([size.w, size.h], mapData);  // range

    let path = d3.geoPath(projection);

    // bind data to svg canvas
    let pathSel = mapG.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('id', function(d){ return d.properties.GEO_ID;})
        .attr('d', function(d) {
            return path(d);  // always pass d attribute for paths b/c that's the SVG standard
        });

    return pathSel;

}

function choroplethizeMap(pathSel, mortData){

     // make the color scale
     let extent = d3.extent(mortData, d=> d.Percent_Change_Mortality_Rate_1980_2014);

     let colorScale = d3.scaleSequential()
         .domain(extent)
         .interpolator(d3.interpolateRdYlBu);

    
    // selecting the geographic data here with d
    pathSel.style('fill', function (d){
        // let countyCode = d.properties.COUNTY;

        // filter is an array function so it will return elements that meet condition -- here we are matching the names in both sets, brk_a3 and countryCode
        let county = mortData.filter(ele => ele.GEO_ID === d.properties.GEO_ID);
        console.log(county); // county has an array of objects

        if (county.length > 0) {
            county = county[0];
            return colorScale(mortData.Percent_Change_Mortality_Rate_1980_2014);
        }
        return "#aaa";
    })


}