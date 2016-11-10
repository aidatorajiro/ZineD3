// This script is under the WTFPL.
//
//         DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
//                     Version 2, December 2004 
// 
//  Copyright (C) 2016 Torajiro Aida
// 
//  Everyone is permitted to copy and distribute verbatim or modified 
//  copies of this license document, and changing it is allowed as long 
//  as the name is changed. 
// 
//             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
//    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 
// 
//   0. You just DO WHAT THE FUCK YOU WANT TO.

require.config({
  paths: {
    d3: "http://d3js.org/d3.v3.min",
    jquery: "http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
  }
});

require(["d3", "jquery"], function(d3) {
    Main = {}
    Main.gcd = function(a, b) {
        if (! b) {
            return a;
        }
        return Main.gcd(b, a % b);
    }
    
    Main.zine_all = function(a, b) {
        var list = [];
        var g = Main.gcd(a,b);
        for (var i = 0; i != g; i++) {
            list.push(Main.zine(a/g, b/g, i/g));
        }
        return list;
    }
    
    Main.zine = function (a, b, c) {
        if (c == undefined) {c = 0}
        var list=[];
        for (var i = 0; i != a; i++) {
            list.push([Math.sin(2*((b*i)%a+c)*Math.PI/a),Math.cos(2*((b*i)%a+c)*Math.PI/a)]);
        }
        return list;
    }
    
    Main.prepare = function () {
        Main.point_radius = 8;
        
        Main.x = d3.scale.linear()
            .domain([-1, 1])
            .range([$(window).width()/2-100, $(window).width()/2+100]);
        
        Main.y = d3.scale.linear()
            .domain([-1, 1])
            .range([$(window).height()/2-100, $(window).height()/2+100]);
        
        Main.line = d3.svg.line()
            .x(function(d) { return Main.x(d.pos[0]); })
            .y(function(d) { return Main.y(d.pos[1]); });
        
        Main.svg = d3.select("body")
                    .append("svg")
                    .attr("width", $(window).width())
                    .attr("height", $(window).height())
                    .call(
                        d3.behavior.zoom()
                        .x(Main.x)
                        .y(Main.y)
                        .scaleExtent([1, 100])
                        .on("zoom", Main.zoom)
                    );
        
        Main.svg.append("rect")
            .attr("class", "overlay")
            .attr("width", $(window).width())
            .attr("height", $(window).height())
            .style("fill", "#000000");
        
        $(window).on('resize', function(){
            Main.svg.attr("width", $(window).width())
                .attr("height", $(window).height());
            Main.svg.selectAll(".overlay")
                .attr("width", $(window).width())
                .attr("height", $(window).height());
        });
    }
    
    Main.draw_zine = function(svg, a, b) {
    
        // Wrapperを作る
        var group = Main.svg
            .append("g")
            .data($.map(Main.zine_all(a,b), function(d){
                return [$.map(d, function (d) {
                    return {pos: d};
                })];
            }));
    
        // 線を描画
        group
            .append("path")
            .attr('stroke', 'white')
            .attr('stroke-width', '1.5')
            .attr('fill', 'transparent')
            .attr('d', Main.plot_line)
            .attr("class", "zine_line");
    
        // 円を描画
        group
            .selectAll("circle")
            .data(function(d){return d;})
            .enter()
            .append("circle")
            .attr("transform", Main.plot_circle)
            .attr("r", Main.point_radius)
            .attr("class", "zine_circle")
            .style("fill", "#4DB4D6");
        
        return group
    }
    
    Main.redraw_zine = function(group, a, b) {
        group.data($.map(Main.zine_all(a,b), function(d){
            return [$.map(d, function (d) {
                return {pos: d};
            })];
        }));
        
        group.select("path").attr('d', Main.plot_line);
        
        circle = group.selectAll("circle")
            .data(function(d){return d;})
        
        circle.enter()
            .append("circle")
            .attr("transform", Main.plot_circle)
            .attr("r", Main.point_radius)
            .attr("class", "zine_circle")
            .style("fill", "#4DB4D6");
        
        circle.exit().remove();
        
        group.exit().remove();
        
        Main.zoom();
        
        return group
    }
    
    Main.registed_zine = [];
    Main.regist_zine = function (a,b) {
        Main.registed_zine.push([a,b,Main.draw_zine(Main.svg, a, b)]);
        return Main.registed_zine.length - 1;
    }
    Main.change_zine = function (i,a,b) {
        Main.registed_zine[i] = [a, b, Main.redraw_zine(Main.registed_zine[i][2], a, b)]
        return i;
    }
    Main.export_to_stl = function () {
        var stlname = $.map(Main.registed_zine,function(a){return a.join("_")}).join("__")
        var stl = "solid zine_" + stlname + "\n"
        $.each(Main.registed_zine, function (i, z) {
            var vertices = Main.zine_all.apply(window, z);
        });
        stl += "endsolid zine_" + stlname
        return stl
    }
    
    // Zoom/Plot関係
    Main.plot_line = function(d) {
        return Main.line(d)+"Z";
    }
    
    Main.plot_circle = function (d) {
        return "translate(" + Main.x(d.pos[0]) + "," + Main.y(d.pos[1]) + ")";
    }
    
    Main.zoom = function () {
        Main.svg.selectAll(".zine_circle")
            .attr("transform", Main.plot_circle);
        Main.svg.selectAll(".zine_line")
            .attr('d', Main.plot_line);
    }

});
