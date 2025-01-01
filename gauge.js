class utils {
    static degreeToRad(degress){
        return degress * (Math.PI/180);
    }

    static _createSVGElement(parentElement, width, height){
        var newSVGElement=document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        newSVGElement.setAttribute('width', width);
        newSVGElement.setAttribute('height', height);
        newSVGElement.setAttribute('viewbox', '0 0 '+width+ ' '+height);

        parentElement.appendChild(newSVGElement);

        return newSVGElement;
    }
    static _createElement(parentElement, type){
        var newSVGElement=document.createElementNS('http://www.w3.org/2000/svg',type);
        parentElement.appendChild(newSVGElement);
        return newSVGElement;
    }
}

class windrose{
    container;
    dialsvg;
    width;
    height;

    dialContainer1;
    dialContainer2;
    
    OPointX;
    OPointY;

    constructor ({container}){
        this.container=document.getElementById(container);
        this.width=parseInt(this.container.style.width);
        this.height=parseInt(this.container.style.height);

        this.dialsvg=utils._createSVGElement(this.container, this.width, this.height);
        var stroke="black";

        var draw="";
        var textElements="";

        this.OPointX=this.width/2;
        this.OPointY=this.height/2;

        //small x

        var hyp=0.5*this.width;
        for (var i=0;i<8;i++){
            var hyp2;
            if (i==0 || i==4){
                hyp2=(hyp*0.8);
            }else if (i==2 || i== 6){
                hyp2=(hyp*0.8);
            }else{
                hyp2=(hyp*0.75);
            }   

            var x1=(this.width/2)-(hyp2*Math.cos(utils.degreeToRad(i*22.5)));
            var y1=(this.height/2)-(hyp2*Math.sin(utils.degreeToRad(i*22.5)));
            var x2=(this.width/2)-(hyp2*Math.cos(utils.degreeToRad((i*22.5)+180)));
            var y2=(this.height/2)-(hyp2*Math.sin(utils.degreeToRad((i*22.5)+180)));

            var x3=(this.width/2)-((hyp2+12)*Math.cos(utils.degreeToRad(i*22.5)));
            var y3=(this.height/2)-((hyp2+12)*Math.sin(utils.degreeToRad(i*22.5)));
            var x4=(this.width/2)-((hyp2+12)*Math.cos(utils.degreeToRad(((i*22.5)+180))));
            var y4=(this.height/2)-((hyp2+12)*Math.sin(utils.degreeToRad(((i*22.5)+180))));

            textElements+="<text font-size='10px' x='"+(x3)+"' y='"+y3+"' dominant-baseline='middle' text-anchor='middle'>"+this.text_main[i]+"</text>";
            textElements+="<text font-size='10px' x='"+(x4)+"' y='"+y4+"' dominant-baseline='middle' text-anchor='middle'>"+this.text_main[i+8]+"</text>";

            draw+="M " + x1 + " " + y1 + " ";
            draw+="L " + x2 + " " + y2 + " ";
        }
        var background=utils._createElement(this.dialsvg, "path");
        background.setAttribute("stroke", stroke);
        background.setAttribute("d", draw);

        this.dialsvg.innerHTML+=textElements;

        var handLength=(this.width * 0.45);

        this.dialContainer1=utils._createElement(this.dialsvg, "path");
        this.dialContainer2=utils._createElement(this.dialsvg, "path");

        var handBody="";
        handBody="M " + this.OPointX + " " + this.OPointY + " "
        handBody+="L " + (this.OPointX-handLength)+ " "+ + this.OPointY;
        this.dialContainer1.setAttribute("d", handBody);
        this.dialContainer1.setAttribute("stroke", 'black');

        var handHead="";
        handHead+="M " + (this.OPointX-handLength) + " "+ this.OPointY + " ";
        handHead+="L " + (this.OPointX-handLength+20) +" " + (this.OPointY-10) + " ";
        handHead+="L " + (this.OPointX-handLength+20) + " "+ (this.OPointY+10) + " ";
        handHead+="L " + (this.OPointX-handLength) +  " "+ this.OPointY + " ";
        this.dialContainer2.setAttribute("d", handHead);
	}
    text_main=['W','WNW','NW','NNW','N','NNE','NE','ENE','E', 'ESE','SE','SSE','S', 'SSW','SW','WSW'];

    setDialValue(value){
        //get index from text_main
        var i=this.text_main.findIndex((element) => element==value.toUpperCase());
        var deg=i*22.5;
        

        this.dialContainer1.style="transform-origin: "+ this.OPointX + "px " + this.OPointY +"px; transform: rotate(" + deg+"deg); transition: transform 2s;"    
        this.dialContainer2.style="transform-origin: "+this.OPointX + "px " + this.OPointY + "px; transform: rotate(" + deg+"deg); transition: transform 2s;"  
    }
}

class thermometer{
    container;
    dialsvg;
    width;
    height;

    dialContainer1;

    
    OPointX;
    OPointY;

    columnwidth=40;

    fluid;
    minvalue;
    maxvalue;

    numberPixelYPerC;

    fluidStartY; //alwasy fixed
    fluidMaxEndY; //this is the max of the scale - cannot go beyond

    x1;y1;
    x2;y2;
    x3;y3;
    x4;y4;
    x5;y5;

    showMinorScale;
    showEveryScale;

    addMaxMinMarkers;

    minMarker;
    maxMarker;



    constructor ({container, minvalue, maxvalue, value, fill, showMinorScale, showEveryScale, addMaxMinMarkers}){
        this.container=document.getElementById(container);
        this.width=parseInt(this.container.style.width);
        this.height=parseInt(this.container.style.height);

        this.dialsvg=utils._createSVGElement(this.container, this.width, this.height);

        var midwidth=this.width/2;

        var draw="";
        var hyp=15;

        var topCurveY=10;

        if (showMinorScale!==undefined)
            this.showMinorScale=showMinorScale;
        else
            this.showMinorScale=false;

        if (showEveryScale!==undefined){
            this.showEveryScale=showEveryScale;
        }else{
            this.showEveryScale=false;
        }
        if (addMaxMinMarkers!==undefined){
            this.addMaxMinMarkers=addMaxMinMarkers;
        }else{
            addMaxMinMarkers=false;
        }
    
        this.minvalue=minvalue;
        this.maxvalue=maxvalue;
 
        var thetaWidth=45;
        var startTheta=90-(thetaWidth/2);
        var deltaTheta=(360-thetaWidth)/4;


        //    10  10
        //
        //   xy1  xy5
        // xy2      xy4
        //      xy3

        this.x1=(this.width/2)-(hyp * Math.cos(utils.degreeToRad(startTheta)));
        this.y1=this.height-hyp-(hyp * Math.sin(utils.degreeToRad(startTheta)));

        this.x2=(this.width/2)-(hyp * Math.cos(utils.degreeToRad(startTheta-deltaTheta)));
        this.y2=this.height-hyp-(hyp * Math.sin(utils.degreeToRad(startTheta-deltaTheta)));

        this.x3=(this.width/2)-(hyp * Math.cos(utils.degreeToRad(startTheta-(2*deltaTheta))));
        this.y3=this.height-hyp-(hyp * Math.sin(utils.degreeToRad(startTheta-(2*deltaTheta))));

        this.x4=(this.width/2)-(hyp * Math.cos(utils.degreeToRad(startTheta-(3*deltaTheta))));
        this.y4=this.height-hyp-(hyp * Math.sin(utils.degreeToRad(startTheta-(3*deltaTheta))));

        this.x5=(this.width/2)-(hyp * Math.cos(utils.degreeToRad(startTheta-(4*deltaTheta))));
        this.y5=this.height-hyp-(hyp * Math.sin(utils.degreeToRad(startTheta-(4*deltaTheta))));

        var drawBase="";

        var base=utils._createElement(this.dialsvg, "circle");
        base.setAttribute("stroke", "none");
        base.setAttribute("fill",fill);
        base.setAttribute("cx", this.width/2);
        base.setAttribute("cy", this.height-hyp);
        base.setAttribute("r", hyp);

        draw="";
        //draw+="<path stroke='"+ stroke+"' fill='"+fill+"' d='"
       // draw+="M " + (this.width/2) + " " + (this.height-(2*hyp)) + " ";
        draw+="M" + this.x1 + " "  + this.y1 + " ";
        draw+="A "+ hyp + " " +hyp + " 0 0 0 " + this.x2 + " " + this.y2 + " ";
        draw+="A "+ hyp + " " +hyp + " 0 0 0 " + this.x3 + " " + this.y3 + " ";
        draw+="A "+ hyp + " " +hyp + " 0 0 0 " + this.x4 + " " + this.y4 + " ";
        draw+="A "+ hyp + " " +hyp + " 0 0 0 " + this.x5 + " " + this.y5 + " ";
        draw+="L " + this.x5 + " " + topCurveY+ " "; 
        draw+="A 5 5 "+this.x5+" 0 0 "+this.x1+" " + topCurveY;
        // draw+="L " + x1 + " " + 10 + " ";
        draw+="L " + this.x1 + " " + this.y1 + " ";
        //draw+="' />"

        var stroke="black";

        var outline=utils._createElement(this.dialsvg, "path");
        outline.setAttribute("stroke", stroke);
        outline.setAttribute("fill", 'none');
        outline.setAttribute("d", draw);

        this.fluidStartY=this.y5-20;
        this.fluidMaxEndY=topCurveY+20;

        this.maxvalue=this.roundup(maxvalue, 10);
        this.minvalue=this.rounddown(minvalue,10);

        this.numberPixelYPerC= (this.fluidStartY-this.fluidMaxEndY)/ (this.maxvalue-this.minvalue);
        
        this.fluid=utils._createElement(this.dialsvg, "rect");
        this.fluid.setAttribute("stroke", 'none');
        this.fluid.setAttribute("fill", fill);
        this.setValue(value);

        //Calculate scale
        //round max up to near 10, round min down to nearest 10

        var drawScale="";

        for (var thisValue=this.minvalue; thisValue<=this.maxvalue; thisValue++){

            if (thisValue%10==0){

                drawScale+="M " + (this.x1-10) + " " + (this.fluidStartY-((thisValue-this.minvalue)*this.numberPixelYPerC)) + " ";
                drawScale+="L " +(this.x1-2)  + " " + (this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC)) + " ";


                var renderText=(thisValue)+"";
                var thisText=utils._createElement(this.dialsvg,"text");
                thisText.setAttribute("x",(this.x1-renderText.length*8-12));
                thisText.setAttribute("y",(this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC) +5));
                thisText.setAttribute("class","");
                thisText.textContent=renderText + "";
            }else if (thisValue%5==0 && this.showMinorScale){
                drawScale+="M " + (this.x1-6) + " " + (this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC)) + " ";
                drawScale+="L " +(this.x1-2)  + " " + (this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC)) + " ";
            }else if (this.showEveryScale){
                drawScale+="M " + (this.x1-4) + " " + (this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC))  + " ";
                drawScale+="L " +(this.x1-2)  + " " + (this.fluidStartY-((thisValue-this.minvalue)* this.numberPixelYPerC))  + " ";
            }
        }

        this.scale=utils._createElement(this.dialsvg, "path");
        this.scale.setAttribute("stroke", "#000");
        //this.fluid.setAttribute("fill", 'blue');
        this.scale.setAttribute("d", drawScale);

        if (addMaxMinMarkers){
            var maxMarkerPath="";

            maxMarkerPath="M " + (this.x1+20)+ " " + this.fluidMaxEndY + " ";
            maxMarkerPath+="L " + (this.x1+30)+ " " + (this.fluidMaxEndY-5) + " ";
            maxMarkerPath+="L " + (this.x1+30)+ " " + (this.fluidMaxEndY+5) + " ";
            maxMarkerPath+="L " + (this.x1+20)+ " " + this.fluidMaxEndY + " ";

            this.maxMarker=utils._createElement(this.dialsvg, "path");
            //this.scale.setAttribute("stroke", "#000");
            this.maxMarker.setAttribute("fill", 'red');
            this.maxMarker.setAttribute("d", maxMarkerPath);
            this.maxMarker.style="transistion: "


            var minMarkerPath="";
            minMarkerPath="M " + (this.x1+20)+ " " + this.fluidStartY + " "; 
            minMarkerPath+="L " + (this.x1+30)+ " " + (this.fluidStartY-5) + " ";
            minMarkerPath+="L " + (this.x1+30)+ " " + (this.fluidStartY+5) + " ";
            minMarkerPath+="L " + (this.x1+20)+ " " + this.fluidStartY + " ";

            this.minMarker=utils._createElement(this.dialsvg, "path");
            //this.scale.setAttribute("stroke", "#000");
            this.minMarker.setAttribute("fill", 'blue');
            this.minMarker.setAttribute("d", minMarkerPath);
        }
	}
    setValue(value){      
        if (value<this.minvalue){
            value=this.minvalue;
        }
        if (value>this.maxvalue){
            value=this.maxvalue;
        }

        var barHeight=this.numberPixelYPerC * (value-this.minvalue);

        this.fluid.setAttribute("width",this.x5-this.x1-2);
        this.fluid.setAttribute("height", (barHeight+ this.y1-this.fluidStartY));
        this.fluid.setAttribute("x", this.x1+1);
        this.fluid.setAttribute("y", this.fluidStartY-barHeight);
    }

    setMinValue(value){
        //this.dialContainer1.style="transform-origin: "+ this.OPointX + "px " + this.OPointY +"px; transform: rotate(" + deg+"deg); transition: transform 2s;" 
        var minMarkerY=(value-this.minvalue)* -this.numberPixelYPerC;


        this.minMarker.style="transform: translate(0px, " + minMarkerY + "px); transition: transform 2s;"
    }
    setMaxValue(value){
        var maxMarkerY=(value-this.maxvalue)* -this.numberPixelYPerC;


        this.maxMarker.style="transform: translate(0px, " + maxMarkerY + "px); transition: transform 2s;"
    }

    rounddown(value, closest){
        return Math.floor(value/closest)*closest;
    }
    roundup(value, closest){
        return Math.ceil(value/closest)*closest;
    }
}

class gauge{
	container;
    dialsvg;
    width;
    height;

    dialContainer1;
    dialContainer2;

    dial2container1;
    dial2container2;

    OPointX;
    OPointY;
    interval;
    hasHand2;

    midPoint=false;
    Colours=[];
    ColoursDefined=false;

    Labels=[];
    LabelsDefined=false;

    LabelFontSize="";

    constructor({container, steps, hasHand2, midPoint, Colours, Labels, LabelFontSize}){
        this.container=document.getElementById(container);
        this.width=parseInt(this.container.style.width);
        this.height=parseInt(this.container.style.height);

        if (midPoint!==undefined){
            this.midPoint=midPoint;
        }

        if (Colours!==undefined && Colours.length==steps){
            this.Colours=Colours;
            this.ColoursDefined=true;
        }

        if (Labels!==undefined && Labels.length==steps){
            this.Labels=Labels;
            this.LabelsDefined=true;
        }

        if (LabelFontSize!==undefined){
            this.LabelFontSize=LabelFontSize;
        }

        this.dialsvg=utils._createSVGElement(this.container, this.width, this.height);

        this.hasHand2=hasHand2;

        var halfwidth=this.width/2;
        
        this.interval = 180/steps;
        var coloursteps = 255/steps;
        this.OPointX=(this.width-2)/2;
        this.OPointY=(this.height-2);

        var hyp = (this.width-4)/2;

        var draw="";

        

        for (var i=0; i<steps;i++ ){
            //start Red, end of Green
            var r=(i*coloursteps);
            var g=255-(i*coloursteps);
            var b=0;

            var fill="rgb(" + r + "," + g+ "," + b + ")";

            if (this.ColoursDefined){
                fill=Colours[i];
            }

            var stroke="gray";


            var theta=i*this.interval;
            var x1=this.OPointX-(hyp * Math.cos(utils.degreeToRad(theta+this.interval)));
            var y1=this.OPointY-(hyp * Math.sin(utils.degreeToRad(theta+this.interval)));
            var x2=this.OPointX-(hyp * Math.cos(utils.degreeToRad(theta)));
            var y2=this.OPointY-(hyp * Math.sin(utils.degreeToRad(theta)));

            var x1_label=this.OPointX-((hyp-10) * Math.cos(utils.degreeToRad(theta+this.interval)));
            var y1_label=this.OPointY-((hyp-10) * Math.sin(utils.degreeToRad(theta+this.interval)));
            var x2_label=this.OPointX-((hyp-10) * Math.cos(utils.degreeToRad(theta)));
            var y2_label=this.OPointY-((hyp-10) * Math.sin(utils.degreeToRad(theta)));


            draw="";
            draw+="M " + this.OPointX + " " + this.OPointY + " ";
            draw+="L " + x1 + " "  + y1 + " ";
            draw+="A "+ hyp + " " +hyp + " 0 0 0 " + x2 + " " + y2 + " ";
            draw+="L " + this.OPointX + " " + this.OPointY + " "; 

            var background=utils._createElement(this.dialsvg, "path");
            background.setAttribute("stroke", stroke);
            background.setAttribute("fill", fill);
            background.setAttribute("d", draw);

            if (this.LabelsDefined){
                var labelPath="";
                labelPath+="M " + x1_label + " " + y1_label + " ";
                labelPath+="A "+ (hyp-10) + " " +(hyp-10) + " 0 0 0 " + x2_label + " " + y2_label + " ";
    
                var pathName=Labels[i].replace(" ","")+"_path";

                var labelPathObject=utils._createElement(this.dialsvg, "path");
                labelPathObject.setAttribute("stroke", 'none');
                labelPathObject.setAttribute("fill", 'none');
                labelPathObject.setAttribute("d", labelPath);
                labelPathObject.setAttribute("id", pathName);

                var backgroundText=utils._createElement(this.dialsvg,"text");

                if (this.LabelFontSize!=""){
                    backgroundText.setAttribute("font-size", this.LabelFontSize);
                }

                //backgroundText.setAttribute("y", y1);
                backgroundText.innerHTML="<textPath startOffset='50%' text-anchor='middle' href='#"+pathName+"'>"+ Labels[i]+"</textPath>";

            }

        }

        this.dialContainer1=utils._createElement(this.dialsvg, "path");
        this.dialContainer2=utils._createElement(this.dialsvg, "path");


        //this.dialsvg.innerHTML=draw;
        //draw the hand
        var handBody="";
        handBody="M " + this.OPointX + " " + this.OPointY + " "
        handBody+="L 2 " + this.OPointY;
        this.dialContainer1.setAttribute("d", handBody);
        this.dialContainer1.setAttribute("stroke", 'black');

        var handHead="";
        handHead+="M 2 " + this.OPointY + " ";
        handHead+="L 22 " + (this.OPointY-10) + " ";
        handHead+="L 22 " + (this.OPointY+10) + " ";
        handHead+="L 2 " + this.OPointY + " ";
        this.dialContainer2.setAttribute("d", handHead);

        if (this.hasHand2){
            this.dial2Container1=utils._createElement(this.dialsvg, "path");
            this.dial2Container2=utils._createElement(this.dialsvg, "path");
    
    
            //this.dialsvg.innerHTML=draw;
            //draw the hand
            var handBody="";
            handBody="M " + this.OPointX + " " + this.OPointY + " "
            handBody+="L " +(2+(this.OPointX/2)) + " " + this.OPointY;
            this.dial2Container1.setAttribute("d", handBody);
            this.dial2Container1.setAttribute("stroke", 'black');
    
            var handHead="";
            handHead+="M " +(2+(this.OPointX/2)) + " " + this.OPointY + " ";
            handHead+="L " +(12+(this.OPointX/2)) + " " + (this.OPointY-7) + " ";
            handHead+="L " +(12+(this.OPointX/2)) + " " + (this.OPointY+7) + " ";
            handHead+="L " +(2+(this.OPointX/2)) + " " + this.OPointY + " ";
            this.dial2Container2.setAttribute("d", handHead);
        }
    }

    setDialValue(value){
        if (this.midPoint){
            value=value+0.5;
        }

        this.dialContainer1.style="transform-origin: "+ this.OPointX + "px " + this.OPointY +"px; transform: rotate(" + (value*this.interval)+"deg); transition: transform 2s;"    
        this.dialContainer2.style="transform-origin: "+this.OPointX + "px " + this.OPointY + "px; transform: rotate(" + (value*this.interval)+"deg); transition: transform 2s;"    
    }
    setDial2Value(value){
        if (this.hasHand2){
            this.dial2Container1.style="transform-origin: "+ this.OPointX + "px " + this.OPointY +"px; transform: rotate(" + (value*this.interval)+"deg); transition: transform 2s;"    
            this.dial2Container2.style="transform-origin: "+this.OPointX + "px " + this.OPointY + "px; transform: rotate(" + (value*this.interval)+"deg); transition: transform 2s;"    
        }
    }
}