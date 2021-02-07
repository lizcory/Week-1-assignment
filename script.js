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

    // create map group -- all parts in map are in this group (grouping things)
    let mapG = svg.append('g')
        .classed('map',true);

     //  load map data
    let pathSel = drawMap(mapG, mapData); 

    choroplethizeMap(pathSel, mortData);  
    
});

let projection;
// draw the regions of the map
function drawMap (mapG, mapData) {

    // 3d >> 2D | create projection function -- and fit the map data we have into our defined width/height
    projection = d3.geoAlbersUsa()
        .fitSize([size.w, size.h], mapData);  // range -- fit this map data (map of us to the size), needs map that it needs to fit

    // change 2D coordinates to single object (string of points) -- pass the projection function to the path function
    let path = d3.geoPath(projection);

    // bind data to svg canvas
    let pathSel = mapG.selectAll('path')
        .data(mapData.features) //map each object/feature (county, in this case)
        .enter()  // how many paths needed to add? all path objects that don't exist yet, needed before drawing the paths -- tells d3 how many paths to add, which is # of objects/features in the mapData array 
        .append('path')  // actually adding the paths
        .attr('id', function(d){ return d.properties.GEO_ID;})
        // we now want to assign the string of points to this d attribute so SVG knows what to draw
        .attr('d', function(d) {
            return path(d);  // always pass d attribute for paths b/c that's the SVG standard
        });

    return pathSel;  // function keeping track of relationship btwn data & SCG elements/paths | returning this function so other function has access

}

function choroplethizeMap(pathSel, mortData){

    // ---------- MAKE COLOR SCALE ---------- //
     // make the color scale
     let extent = d3.extent(mortData, d => +d.Percent_Change_Mortality_Rate_1980_2014);
        console.log(extent);

     let colorScale = d3.scaleSequential()
         .domain(extent) // extent has min/max of the mort dataset
         .interpolator(d3.interpolateRdYlBu); // need to convert 3D color space into single dimension

    
    // selecting the geographic data here with d
    // changing the way that this pathSel function works
    // this function is run on each path individually, which each have corresponding data d
    pathSel.style('fill', function (d){
    
        // filter is an array function so it will return elements that meet condition -- here we are matching the names in both sets, brk_a3 and countryCode
        // trying to match GEO_ID of each path, d, to GEO_ID in mortData
        // let county = mortData.filter(ele => ele.GEO_ID === d.properties.GEO_ID);
        
        let county = mortData.filter(ele => +ele.FIPS === +(d.properties.STATE + d.properties.COUNTY));

        // console.log(county); // county has an array of objects

        if (county.length > 0) {
            county = county[0];
            console.log(county.Percent_Change_Mortality_Rate_1980_2014);
            return colorScale(county.Percent_Change_Mortality_Rate_1980_2014);
        }
        return "#aaa";
    })


}