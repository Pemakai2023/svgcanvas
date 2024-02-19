/*!!
 *  SVGCanvas v2.0.3
 *  Draw on SVG using Canvas's 2D Context API.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Kerry Liu
 *  Zeno Zeng
 *
 *  Copyright (c) 2014 Gliffy Inc.
 *  Copyright (c) 2021 Zeno Zeng
 */

import * as utils from './utils.js';
import imageUtils from './image.js';

//export default (function () {
    "use strict";

    //var STYLES, Context, CanvasGradient, CanvasPattern, namedEntities;
    //var Context;

    //helper function to format a string
    //function format(str, args) {
    //    var keys = Object.keys(args), i;
    //    for (i=0; i<keys.length; i++) {
    //        str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
    //    }
    //    return str;
    //}

function tmplt(str, args) {
  if(arguments.length===2) {
    var keys = Object.keys(args), i;
    for (i=0; i<keys.length; i++) {
        str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
    }
    return str;
  } else if(arguments.length===1) {
    return function(args) {
      var keys = Object.keys(args), i;
      for (i=0; i<keys.length; i++) {
          str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
      }
      return str;
      
    }
  }
}
//helper function that generates a random string
function randomString(holder) {
    var chars, randomstring, i;
    if (!holder) {
        throw new Error("cannot create a random attribute name for an undefined object");
    }
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    randomstring = "";
    do {
        randomstring = "";
        for (i = 0; i < 12; i++) {
            randomstring += chars[Math.floor(Math.random() * chars.length)];
        }
    } while (holder[randomstring]);
    return randomstring;
}


//helper function to map canvas-textAlign to svg-textAnchor
function getTextAnchor(textAlign) {
    //TODO: support rtl languages
    var mapping = {"left":"start", "right":"end", "center":"middle", "start":"start", "end":"end"};
    return mapping[textAlign] || mapping.start;
}

//helper function to map canvas-textBaseline to svg-dominantBaseline
function getDominantBaseline(textBaseline) {
    //INFO: not supported in all browsers
    var mapping = {"alphabetic": "alphabetic", "hanging": "hanging", "top":"text-before-edge", "bottom":"text-after-edge", "middle":"central"};
    return mapping[textBaseline] || mapping.alphabetic;
}

var namedEntities = {
"&nbsp;": "&#160;","&iexcl;": "&#161;",
"&cent;": "&#162;","&pound;": "&#163;",
"&curren;": "&#164;","&yen;": "&#165;",
"&brvbar;": "&#166;","&sect;": "&#167;",
"&uml;": "&#168;","&copy;": "&#169;",
"&ordf;": "&#170;","&laquo;": "&#171;",
"&not;": "&#172;","&shy;": "&#173;",
"&reg;": "&#174;","&macr;": "&#175;",
"&deg;": "&#176;","&plusmn;": "&#177;",
"&sup2;": "&#178;","&sup3;": "&#179;",
"&acute;": "&#180;","&micro;": "&#181;",
"&para;": "&#182;","&middot;": "&#183;",
"&cedil;": "&#184;","&sup1;": "&#185;",
"&ordm;": "&#186;","&raquo;": "&#187;",
"&frac14;": "&#188;","&frac12;": "&#189;",
"&frac34;": "&#190;","&iquest;": "&#191;",
"&Agrave;": "&#192;","&Aacute;": "&#193;",
"&Acirc;": "&#194;","&Atilde;": "&#195;",
"&Auml;": "&#196;","&Aring;": "&#197;",
"&AElig;": "&#198;","&Ccedil;": "&#199;",
"&Egrave;": "&#200;","&Eacute;": "&#201;",
"&Ecirc;": "&#202;","&Euml;": "&#203;",
"&Igrave;": "&#204;","&Iacute;": "&#205;",
"&Icirc;": "&#206;","&Iuml;": "&#207;",
"&ETH;": "&#208;","&Ntilde;": "&#209;",
"&Ograve;": "&#210;","&Oacute;": "&#211;",
"&Ocirc;": "&#212;","&Otilde;": "&#213;",
"&Ouml;": "&#214;","&times;": "&#215;",
"&Oslash;": "&#216;","&Ugrave;": "&#217;",
"&Uacute;": "&#218;","&Ucirc;": "&#219;",
"&Uuml;": "&#220;","&Yacute;": "&#221;",
"&THORN;": "&#222;","&szlig;": "&#223;",
"&agrave;": "&#224;","&aacute;": "&#225;",
"&acirc;": "&#226;","&atilde;": "&#227;",
"&auml;": "&#228;","&aring;": "&#229;",
"&aelig;": "&#230;","&ccedil;": "&#231;",
"&egrave;": "&#232;","&eacute;": "&#233;",
"&ecirc;": "&#234;","&euml;": "&#235;",
"&igrave;": "&#236;","&iacute;": "&#237;",
"&icirc;": "&#238;","&iuml;": "&#239;",
"&eth;": "&#240;","&ntilde;": "&#241;",
"&ograve;": "&#242;","&oacute;": "&#243;",
"&ocirc;": "&#244;","&otilde;": "&#245;",
"&ouml;": "&#246;","&divide;": "&#247;",
"&oslash;": "&#248;","&ugrave;": "&#249;",
"&uacute;": "&#250;","&ucirc;": "&#251;",
"&uuml;": "&#252;","&yacute;": "&#253;",
"&thorn;": "&#254;","&yuml;": "&#255;",
"&fnof;": "&#402;","&Alpha;": "&#913;",
"&Beta;": "&#914;","&Gamma;": "&#915;",
"&Delta;": "&#916;","&Epsilon;": "&#917;",
"&Zeta;": "&#918;","&Eta;": "&#919;",
"&Theta;": "&#920;","&Iota;": "&#921;",
"&Kappa;": "&#922;","&Lambda;": "&#923;",
"&Mu;": "&#924;","&Nu;": "&#925;",
"&Xi;": "&#926;","&Omicron;": "&#927;",
"&Pi;": "&#928;","&Rho;": "&#929;",
"&Sigma;": "&#931;","&Tau;": "&#932;",
"&Upsilon;": "&#933;","&Phi;": "&#934;",
"&Chi;": "&#935;","&Psi;": "&#936;",
"&Omega;": "&#937;","&alpha;": "&#945;",
"&beta;": "&#946;","&gamma;": "&#947;",
"&delta;": "&#948;","&epsilon;": "&#949;",
"&zeta;": "&#950;","&eta;": "&#951;",
"&theta;": "&#952;","&iota;": "&#953;",
"&kappa;": "&#954;","&lambda;": "&#955;",
"&mu;": "&#956;","&nu;": "&#957;",
"&xi;": "&#958;","&omicron;": "&#959;",
"&pi;": "&#960;","&rho;": "&#961;",
"&sigmaf;": "&#962;","&sigma;": "&#963;",
"&tau;": "&#964;","&upsilon;": "&#965;",
"&phi;": "&#966;","&chi;": "&#967;",
"&psi;": "&#968;","&omega;": "&#969;",
"&thetasym;": "&#977;","&upsih;": "&#978;",
"&piv;": "&#982;","&bull;": "&#8226;",
"&hellip;": "&#8230;","&prime;": "&#8242;",
"&Prime;": "&#8243;","&oline;": "&#8254;",
"&frasl;": "&#8260;","&weierp;": "&#8472;",
"&image;": "&#8465;","&real;": "&#8476;",
"&trade;": "&#8482;","&alefsym;": "&#8501;",
"&larr;": "&#8592;","&uarr;": "&#8593;",
"&rarr;": "&#8594;","&darr;": "&#8595;",
"&harr;": "&#8596;","&crarr;": "&#8629;",
"&lArr;": "&#8656;","&uArr;": "&#8657;",
"&rArr;": "&#8658;","&dArr;": "&#8659;",
"&hArr;": "&#8660;","&forall;": "&#8704;",
"&part;": "&#8706;","&exist;": "&#8707;",
"&empty;": "&#8709;","&nabla;": "&#8711;",
"&isin;": "&#8712;","&notin;": "&#8713;",
"&ni;": "&#8715;","&prod;": "&#8719;",
"&sum;": "&#8721;","&minus;": "&#8722;",
"&lowast;": "&#8727;","&radic;": "&#8730;",
"&prop;": "&#8733;","&infin;": "&#8734;",
"&ang;": "&#8736;","&and;": "&#8743;",
"&or;": "&#8744;","&cap;": "&#8745;",
"&cup;": "&#8746;","&int;": "&#8747;",
"&there4;": "&#8756;","&sim;": "&#8764;",
"&cong;": "&#8773;","&asymp;": "&#8776;",
"&ne;": "&#8800;","&equiv;": "&#8801;",
"&le;": "&#8804;","&ge;": "&#8805;",
"&sub;": "&#8834;","&sup;": "&#8835;",
"&nsub;": "&#8836;","&sube;": "&#8838;",
"&supe;": "&#8839;","&oplus;": "&#8853;",
"&otimes;": "&#8855;","&perp;": "&#8869;",
"&sdot;": "&#8901;","&lceil;": "&#8968;",
"&rceil;": "&#8969;","&lfloor;": "&#8970;",
"&rfloor;": "&#8971;","&lang;": "&#9001;",
"&rang;": "&#9002;","&loz;": "&#9674;",
"&spades;": "&#9824;","&clubs;": "&#9827;",
"&hearts;": "&#9829;","&diams;": "&#9830;",
"&OElig;": "&#338;","&oelig;": "&#339;",
"&Scaron;": "&#352;","&scaron;": "&#353;",
"&Yuml;": "&#376;","&circ;": "&#710;",
"&tilde;": "&#732;","&ensp;": "&#8194;",
"&emsp;": "&#8195;","&thinsp;": "&#8201;",
"&zwnj;": "&#8204;","&zwj;": "&#8205;",
"&lrm;": "&#8206;","&rlm;": "&#8207;",
"&ndash;": "&#8211;","&mdash;": "&#8212;",
"&lsquo;": "&#8216;","&rsquo;": "&#8217;",
"&sbquo;": "&#8218;","&ldquo;": "&#8220;",
"&rdquo;": "&#8221;","&bdquo;": "&#8222;",
"&dagger;": "&#8224;","&Dagger;": "&#8225;",
"&permil;": "&#8240;","&lsaquo;": "&#8249;",
"&rsaquo;": "&#8250;","&euro;": "&#8364;",
"\\xa0": "&#160;"
};
//Some basic mappings for attributes and default values.
var STYLES = {
    "strokeStyle":{
        svgAttr : "stroke", //corresponding svg attribute
        canvas : "#000000", //canvas default
        svg : "none",       //svg default
        apply : "stroke"    //apply on stroke() or fill()
    },
    "fillStyle":{
        svgAttr : "fill",
        canvas : "#000000",
        svg : null, //svg default is black, but we need to special case this to handle canvas stroke without fill
        apply : "fill"
    },
    "lineCap":{
        svgAttr : "stroke-linecap",
        canvas : "butt",
        svg : "butt",
        apply : "stroke"
    },
    "lineJoin":{
        svgAttr : "stroke-linejoin",
        canvas : "miter",
        svg : "miter",
        apply : "stroke"
    },
    "miterLimit":{
        svgAttr : "stroke-miterlimit",
        canvas : 10,
        svg : 4,
        apply : "stroke"
    },
    "lineWidth":{
        svgAttr : "stroke-width",
        canvas : 1,
        svg : 1,
        apply : "stroke"
    },
    "globalAlpha": {
        svgAttr : "opacity",
        canvas : 1,
        svg : 1,
        apply :  "fill stroke"
    },
    "font":{
        //font converts to multiple svg attributes, there is custom logic for this
        canvas : "10px sans-serif"
    },
    "shadowColor":{
        canvas : "#000000"
    },
    "shadowOffsetX":{
        canvas : 0
    },
    "shadowOffsetY":{
        canvas : 0
    },
    "shadowBlur":{
        canvas : 0
    },
    "textAlign":{
        canvas : "start"
    },
    "textBaseline":{
        canvas : "alphabetic"
    },
    "lineDash" : {
        svgAttr : "stroke-dasharray",
        canvas : [],
        svg : null,
        apply : "stroke"
    }
};

/**
 *
 * @param gradientNode - reference to the gradient
 * @constructor
 */
class CanvasGradient {
  constructor(gradientNode, ctx) {
      this.__root = gradientNode;
      this.__ctx = ctx;
  }

  /**
   * Adds a color stop to the gradient root
   */
  addColorStop(offset, color) {
      var stop = this.__ctx.__createElement("stop"), regex, matches;
      stop.setAttribute("offset", offset);
      if (utils.toString(color).indexOf("rgba") !== -1) {
          //separate alpha value, since webkit can't handle it
          regex = /rgba\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
          matches = regex.exec(color);
          //stop.setAttribute("stop-color", tmplt("rgb({r},{g},{b})", {r:matches[1], g:matches[2], b:matches[3]}));
          stop.setAttribute("stop-color", tmplt("rgb({r},{g},{b})")({r:matches[1], g:matches[2], b:matches[3]})) ;
          stop.setAttribute("stop-opacity", matches[4]);
      } else {
          stop.setAttribute("stop-color", utils.toString(color));
      }
      this.__root.appendChild(stop);
  }
};


class CanvasPattern {
  constructor(pattern, ctx) {
      this.__root = pattern;
      this.__ctx = ctx;
  }
}

/**
 * The mock canvas context
 * @param o - options include:
 * ctx - existing Context2D to wrap around
 * width - width of your canvas (defaults to 500)
 * height - height of your canvas (defaults to 500)
 * enableMirroring - enables canvas mirroring (get image data) (defaults to false)
 * document - the document object (defaults to the current document)
 */
export default class Context {
  constructor(o) {

      var defaultOptions = { width:500, height:500, enableMirroring : false}, options;

      // keep support for this way of calling Context: new Context(width, height)
      if (arguments.length > 1) {
          options = defaultOptions;
          options.width = arguments[0];
          options.height = arguments[1];
      } else if ( !o ) {
          options = defaultOptions;
      } else {
          options = o;
      }

      if (!(this instanceof Context)) {
          //did someone call this without new?
          return new Context(options);
      }

      //setup options
      this.width = options.width || defaultOptions.width;
      this.height = options.height || defaultOptions.height;
      this.enableMirroring = options.enableMirroring !== undefined ? options.enableMirroring : defaultOptions.enableMirroring;

      this.canvas = this;   ///point back to this instance!
      this.__document = options.document || document;

      // allow passing in an existing context to wrap around
      // if a context is passed in, we know a canvas already exist
      if (options.ctx) {
          this.__ctx = options.ctx;
      } else {
          this.__canvas = this.__document.createElement("canvas");
          this.__ctx = this.__canvas.getContext("2d");
      }

      this.__setDefaultStyles();
      this.__styleStack = [this.__getStyleState()];
      this.__groupStack = [];

      //the root svg element
      this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.__root.setAttribute("version", 1.1);
      this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      this.__root.setAttribute("width", this.width);
      this.__root.setAttribute("height", this.height);

      //make sure we don't generate the same ids in defs
      this.__ids = {};

      //defs tag
      this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs");
      this.__root.appendChild(this.__defs);

      //also add a group child. the svg element can't use the transform attribute
      this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.__root.appendChild(this.__currentElement);

      // init transformation matrix
      this.resetTransform();

      this.__options = options;
      this.__id = Math.random().toString(16).substring(2, 8);
      this.__debug(`new`, o);
  }

  /**
   * Log
   *
   * @private
   */
  __debug(...data) {
      if (!this.__options.debug) {
          return
      }
      console.debug(`svgcanvas#${this.__id}:`, ...data)
  }

  /**
   * Creates the specified svg element
   * @private
   */
  __createElement(elementName, properties, resetFill) {
      if (typeof properties === "undefined") {
          properties = {};
      }

      var element = this.__document.createElementNS("http://www.w3.org/2000/svg", elementName),
          keys = Object.keys(properties), i, key;
      if (resetFill) {
          //if fill or stroke is not specified, the svg element should not display. By default SVG's fill is black.
          element.setAttribute("fill", "none");
          element.setAttribute("stroke", "none");
      }
      for (i=0; i<keys.length; i++) {
          key = keys[i];
          element.setAttribute(key, properties[key]);
      }
      return element;
  }

  /**
   * Applies default canvas styles to the context
   * @private
   */
  __setDefaultStyles() {
      //default 2d canvas context properties see:http://www.w3.org/TR/2dcontext/
      var keys = Object.keys(STYLES), i, key;
      for (i=0; i<keys.length; i++) {
          key = keys[i];
          this[key] = STYLES[key].canvas;
      }
  }

  /**
   * Applies styles on restore
   * @param styleState
   * @private
   */
  __applyStyleState(styleState) {
      var keys = Object.keys(styleState), i, key;
      for (i=0; i<keys.length; i++) {
          key = keys[i];
          this[key] = styleState[key];
      }
  }

  /**
   * Gets the current style state
   * @return {Object}
   * @private
   */
  __getStyleState() {
      var i, styleState = {}, keys = Object.keys(STYLES), key;
      for (i=0; i<keys.length; i++) {
          key = keys[i];
          styleState[key] = this[key];
      }
      return styleState;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
   */
  __applyTransformation(element, matrix) {
      const {a, b, c, d, e, f} = matrix || this.getTransform();
      element.setAttribute('transform', `matrix(${a} ${b} ${c} ${d} ${e} ${f})`)
  }

  /**
   * Apples the current styles to the current SVG element. On "ctx.fill" or "ctx.stroke"
   * @param type
   * @private
   */
  __applyStyleToCurrentElement(type) {
      var currentElement = this.__currentElement;
      var currentStyleGroup = this.__currentElementsToStyle;
      if (currentStyleGroup) {
          currentElement.setAttribute(type, "");
          currentElement = currentStyleGroup.element;
          currentStyleGroup.children.forEach(function (node) {
              node.setAttribute(type, "");
          })
      }

      var keys = Object.keys(STYLES), i, style, value, regex, matches, id, nodeIndex, node;
      for (i = 0; i < keys.length; i++) {
          style = STYLES[keys[i]];
          value = this[keys[i]];
          if (style.apply) {
              //is this a gradient or pattern?
              if (value instanceof CanvasPattern) {
                  //pattern
                  if (value.__ctx) {
                      //copy over defs
                      for(nodeIndex = 0; nodeIndex < value.__ctx.__defs.childNodes.length; nodeIndex++){
                        node = value.__ctx.__defs.childNodes[nodeIndex];
                        id = node.getAttribute("id");
                        this.__ids[id] = id;
                        this.__defs.appendChild(node);
                      }
                  }
                  //currentElement.setAttribute(style.apply, tmplt("url(#{id})", {id:value.__root.getAttribute("id")}));
                  currentElement.setAttribute(style.apply, tmplt("url(#{id})")({id:value.__root.getAttribute("id")}));
              }
              //else if (value instanceof CanvasGradient) {
              else if (value instanceof CanvasGradient || value.constructor.name === 'CanvasGradient') {
                  //gradient
                  var attr = tmplt("url(#{id})")
                  currentElement.setAttribute(style.apply, attr({id:value.__root.getAttribute("id")}));
              } else if (style.apply.indexOf(type)!==-1 && style.svg !== value) {
                  //if ((style.svgAttr === "stroke" || style.svgAttr === "fill") && value.indexOf("rgba") !== -1) {
                  if ((style.svgAttr === "stroke" || style.svgAttr === "fill") && value && value.indexOf("rgba") !== -1) {
                      //separate alpha value, since illustrator can't handle it
                      regex = /rgba\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
                      matches = regex.exec(value);
                      var attr = tmplt("rgb({r},{g},{b})")
                      currentElement.setAttribute(style.svgAttr, attr({r:matches[1], g:matches[2], b:matches[3]}));
                      //should take globalAlpha here
                      var opacity = matches[4];
                      var globalAlpha = this.globalAlpha;
                      if (globalAlpha != null) {
                          opacity *= globalAlpha;
                      }
                      currentElement.setAttribute(style.svgAttr+"-opacity", opacity);
                  } else {
                      var attr = style.svgAttr;
                      if (keys[i] === 'globalAlpha') {
                          attr = type+'-'+style.svgAttr;
                          if (currentElement.getAttribute(attr)) {
                               //fill-opacity or stroke-opacity has already been set by stroke or fill.
                              continue;
                          }
                      } else if (keys[i] === 'lineWidth') {
                          var scale = this.__getTransformScale();
                          value = value * Math.max(scale.x, scale.y);
                      }
                      
                      //otherwise only update attribute if right type, and not svg default
                      currentElement.setAttribute(attr, value);
                  }
              }
          }
      }
  }

  /**
   * Will return the closest group or svg node. May return the current element.
   * @private
   */
  __closestGroupOrSvg(node) {
      node = node || this.__currentElement;
      if (node.nodeName === "g" || node.nodeName === "svg") {
          return node;
      } else {
          return this.__closestGroupOrSvg(node.parentNode);
      }
  }

  /**
   * Returns the serialized value of the svg so far
   * @param fixNamedEntities - Standalone SVG doesn't support named entities, which document.createTextNode encodes.
   *                           If true, we attempt to find all named entities and encode it as a numeric entity.
   * @return serialized svg
   */
  getSerializedSvg(fixNamedEntities) {
      var serialized = new XMLSerializer().serializeToString(this.__root),
          keys, i, key, value, regexp, xmlns;

      //IE search for a duplicate xmnls because they didn't implement setAttributeNS correctly
      xmlns = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi;
      if (xmlns.test(serialized)) {
          serialized = serialized.replace('xmlns="http://www.w3.org/2000/svg','xmlns:xlink="http://www.w3.org/1999/xlink');
      }

      if (fixNamedEntities) {
          keys = Object.keys(namedEntities);
          //loop over each named entity and replace with the proper equivalent.
          for (i=0; i<keys.length; i++) {
              key = keys[i];
              value = namedEntities[key];
              regexp = new RegExp(key, "gi");
              if (regexp.test(serialized)) {
                  serialized = serialized.replace(regexp, value);
              }
          }
      }

      return serialized;
  }


  /**
   * Returns the root svg
   * @return
   */
  getSvg() {
      return this.__root;
  }

  /**
   * Will generate a group tag.
   */
  save() {
      var group = this.__createElement("g");
      var parent = this.__closestGroupOrSvg();
      this.__groupStack.push(parent);
      parent.appendChild(group);
      this.__currentElement = group;
      const style = this.__getStyleState();

      this.__debug('save style', style)
      this.__styleStack.push(style);
      if (!this.__transformMatrixStack) {
          this.__transformMatrixStack = [];
      }
      this.__transformMatrixStack.push(this.getTransform());
  }

  /**
   * Sets current element to parent, or just root if already root
   */
  restore() {
      this.__currentElement = this.__groupStack.pop();
      this.__currentElementsToStyle = null;
      //Clearing canvas will make the poped group invalid, currentElement is set to the root group node.
      if (!this.__currentElement) {
          this.__currentElement = this.__root.childNodes[1];
      }
      var state = this.__styleStack.pop();
      this.__debug('restore style', state);
      this.__applyStyleState(state);
      if (this.__transformMatrixStack && this.__transformMatrixStack.length > 0) {
          this.setTransform(this.__transformMatrixStack.pop())
      }

  }

  /**
   * Create a new Path Element
   */
  beginPath() {
      var path, parent;

      // Note that there is only one current default path, it is not part of the drawing state.
      // See also: https://html.spec.whatwg.org/multipage/scripting.html#current-default-path
      this.__currentDefaultPath = "";
      this.__currentPosition = {};

      path = this.__createElement("path", {}, true);
      parent = this.__closestGroupOrSvg();
      parent.appendChild(path);
      this.__currentElement = path;
  }

  /**
   * Helper function to apply currentDefaultPath to current path element
   * @private
   */
  __applyCurrentDefaultPath() {
      var currentElement = this.__currentElement;
      if (currentElement.nodeName === "path") {
          currentElement.setAttribute("d", this.__currentDefaultPath);
      } else {
          console.error("Attempted to apply path command to node", currentElement.nodeName);
      }
  }

  /**
   * Helper function to add path command
   * @private
   */
  __addPathCommand(command) {
      this.__currentDefaultPath += " ";
      this.__currentDefaultPath += command;
  }

  /**
   * Adds the move command to the current path element,
   * if the currentPathElement is not empty create a new path element
   */
  moveTo(x,y) {
      if (this.__currentElement.nodeName !== "path") {
          this.beginPath();
      }

      // creates a new subpath with the given point
      this.__currentPosition = {x: x, y: y};
      var moveXY = tmplt("M {x} {y}")
      this.__addPathCommand(moveXY({
          x: this.__matrixTransform(x, y).x,
          y: this.__matrixTransform(x, y).y
      }));
  }

  /**
   * Closes the current path
   */
  closePath() {
      if (this.__currentDefaultPath) {
          this.__addPathCommand("Z");
      }
  }

  /**
   * Adds a line to command
   */
  lineTo(x, y) {
      this.__currentPosition = {x: x, y: y};
      if (this.__currentDefaultPath.indexOf('M') > -1) {
          var lineXY = tmplt("L {x} {y}")
          this.__addPathCommand(lineXY({
              x: this.__matrixTransform(x, y).x,
              y: this.__matrixTransform(x, y).y
          }));
      } else {
          var moveXY = tmplt("M {x} {y}")
          this.__addPathCommand(moveXY({
              x: this.__matrixTransform(x, y).x,
              y: this.__matrixTransform(x, y).y
          }));
      }
  }

  roundRect(x, y, width, height, radii) {
      if (!this.__currentDefaultPath) {
        this.beginPath();
      }
      this.__currentDefaultPath.roundRect(x, y, width, height, radii);
  }

   /**
   * Add a bezier command
   */
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
      this.__currentPosition = {x: x, y: y};
      var bzCurve = tmplt("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}")
      this.__addPathCommand(bzCurve({
              cp1x: this.__matrixTransform(cp1x, cp1y).x,
              cp1y: this.__matrixTransform(cp1x, cp1y).y,
              cp2x: this.__matrixTransform(cp2x, cp2y).x,
              cp2y: this.__matrixTransform(cp2x, cp2y).y,
              x: this.__matrixTransform(x, y).x,
              y: this.__matrixTransform(x, y).y
          }));
  }

  /**
   * Adds a quadratic curve to command
   */
  quadraticCurveTo(cpx, cpy, x, y) {
      this.__currentPosition = {x: x, y: y};
      var qCurve = tmplt("Q {cpx} {cpy} {x} {y}")
      this.__addPathCommand(qCurve({
          cpx: this.__matrixTransform(cpx, cpy).x,
          cpy: this.__matrixTransform(cpx, cpy).y,
          x: this.__matrixTransform(x, y).x,
          y: this.__matrixTransform(x, y).y
      }));
  }


  /**
   * Return a new normalized vector of given vector
   */
  static normalize(vector) {
      var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
      return [vector[0] / len, vector[1] / len];
  }

  /**
   * Adds the arcTo to the current path
   *
   * @see http://www.w3.org/TR/2015/WD-2dcontext-20150514/#dom-context-2d-arcto
   */
  arcTo(x1, y1, x2, y2, radius) {
      // Let the point (x0, y0) be the last point in the subpath.
      var x0 = this.__currentPosition && this.__currentPosition.x;
      var y0 = this.__currentPosition && this.__currentPosition.y;

      // First ensure there is a subpath for (x1, y1).
      if (typeof x0 == "undefined" || typeof y0 == "undefined") {
          return;
      }

      // Negative values for radius must cause the implementation to throw an IndexSizeError exception.
      if (radius < 0) {
          throw new Error("IndexSizeError: The radius provided (" + radius + ") is negative.");
      }

      // If the point (x0, y0) is equal to the point (x1, y1),
      // or if the point (x1, y1) is equal to the point (x2, y2),
      // or if the radius radius is zero,
      // then the method must add the point (x1, y1) to the subpath,
      // and connect that point to the previous point (x0, y0) by a straight line.
      if (((x0 === x1) && (y0 === y1))
          || ((x1 === x2) && (y1 === y2))
          || (radius === 0)) {
          this.lineTo(x1, y1);
          return;
      }

      // Otherwise, if the points (x0, y0), (x1, y1), and (x2, y2) all lie on a single straight line,
      // then the method must add the point (x1, y1) to the subpath,
      // and connect that point to the previous point (x0, y0) by a straight line.
      var unit_vec_p1_p0 = Context.normalize([x0 - x1, y0 - y1]);
      var unit_vec_p1_p2 = Context.normalize([x2 - x1, y2 - y1]);
      if (unit_vec_p1_p0[0] * unit_vec_p1_p2[1] === unit_vec_p1_p0[1] * unit_vec_p1_p2[0]) {
          this.lineTo(x1, y1);
          return;
      }

      // Otherwise, let The Arc be the shortest arc given by circumference of the circle that has radius radius,
      // and that has one point tangent to the half-infinite line that crosses the point (x0, y0) and ends at the point (x1, y1),
      // and that has a different point tangent to the half-infinite line that ends at the point (x1, y1), and crosses the point (x2, y2).
      // The points at which this circle touches these two lines are called the start and end tangent points respectively.

      // note that both vectors are unit vectors, so the length is 1
      var cos = (unit_vec_p1_p0[0] * unit_vec_p1_p2[0] + unit_vec_p1_p0[1] * unit_vec_p1_p2[1]);
      var theta = Math.acos(Math.abs(cos));

      // Calculate origin
      var unit_vec_p1_origin = Context.normalize([
          unit_vec_p1_p0[0] + unit_vec_p1_p2[0],
          unit_vec_p1_p0[1] + unit_vec_p1_p2[1]
      ]);
      var len_p1_origin = radius / Math.sin(theta / 2);
      var x = x1 + len_p1_origin * unit_vec_p1_origin[0];
      var y = y1 + len_p1_origin * unit_vec_p1_origin[1];

      // Calculate start angle and end angle
      // rotate 90deg clockwise (note that y axis points to its down)
      var unit_vec_origin_start_tangent = [
          -unit_vec_p1_p0[1],
          unit_vec_p1_p0[0]
      ];
      // rotate 90deg counter clockwise (note that y axis points to its down)
      var unit_vec_origin_end_tangent = [
          unit_vec_p1_p2[1],
          -unit_vec_p1_p2[0]
      ];
      var getAngle = function(vector) {
          // get angle (clockwise) between vector and (1, 0)
          var x = vector[0];
          var y = vector[1];
          if (y >= 0) { // note that y axis points to its down
              return Math.acos(x);
          } else {
              return -Math.acos(x);
          }
      };
      var startAngle = getAngle(unit_vec_origin_start_tangent);
      var endAngle = getAngle(unit_vec_origin_end_tangent);

      // Connect the point (x0, y0) to the start tangent point by a straight line
      this.lineTo(x + unit_vec_origin_start_tangent[0] * radius,
                  y + unit_vec_origin_start_tangent[1] * radius);

      // Connect the start tangent point to the end tangent point by arc
      // and adding the end tangent point to the subpath.
      this.arc(x, y, radius, startAngle, endAngle);
  }

  /**
   * Sets the stroke property on the current element
   */
  stroke() {
      if (this.__currentElement.nodeName === "path") {
          this.__currentElement.setAttribute("paint-order", "fill stroke markers");
      }
      this.__applyCurrentDefaultPath();
      this.__applyStyleToCurrentElement("stroke");
  }

  /**
   * Sets fill properties on the current element
   */
  fill() {
      if (this.__currentElement.nodeName === "path") {
          this.__currentElement.setAttribute("paint-order", "stroke fill markers");
      }
      this.__applyCurrentDefaultPath();
      this.__applyStyleToCurrentElement("fill");
  }

  /**
   *  Adds a rectangle to the path.
   */
  rect(x, y, width, height) {
      if (this.__currentElement.nodeName !== "path") {
          this.beginPath();
      }
      this.moveTo(x, y);
      this.lineTo(x+width, y);
      this.lineTo(x+width, y+height);
      this.lineTo(x, y+height);
      this.lineTo(x, y);
      this.closePath();
  }


  /**
   * adds a rectangle element
   */
  fillRect(x, y, width, height) {
      let {a, b, c, d, e, f} = this.getTransform();
      if (JSON.stringify([a, b, c, d, e, f]) === JSON.stringify([1, 0, 0, 1, 0, 0])) {
          //clear entire canvas
          if (x === 0 && y === 0 && width === this.width && height === this.height) {
              this.__clearCanvas();
          }
      }
      var rect, parent;
      rect = this.__createElement("rect", {
          x : x,
          y : y,
          width : width,
          height : height
      }, true);
      parent = this.__closestGroupOrSvg();
      parent.appendChild(rect);
      this.__currentElement = rect;
      this.__applyTransformation(rect);
      this.__applyStyleToCurrentElement("fill");
  }

  /**
   * Draws a rectangle with no fill
   * @param x
   * @param y
   * @param width
   * @param height
   */
  strokeRect(x, y, width, height) {
      var rect, parent;
      rect = this.__createElement("rect", {
          x : x,
          y : y,
          width : width,
          height : height
      }, true);
      parent = this.__closestGroupOrSvg();
      parent.appendChild(rect);
      this.__currentElement = rect;
      this.__applyTransformation(rect);
      this.__applyStyleToCurrentElement("stroke");
  }


  /**
   * Clear entire canvas:
   * 1. save current transforms
   * 2. remove all the childNodes of the root g element
   */
  __clearCanvas() {
      var rootGroup = this.__root.childNodes[1];
      this.__root.removeChild(rootGroup);
      this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.__root.appendChild(this.__currentElement);
      //reset __groupStack as all the child group nodes are all removed.
      this.__groupStack = [];
  }

  /**
   * "Clears" a canvas by just drawing a white rectangle in the current group.
   */
  clearRect(x, y, width, height) {
      let {a, b, c, d, e, f} = this.getTransform();
      if (JSON.stringify([a, b, c, d, e, f]) === JSON.stringify([1, 0, 0, 1, 0, 0])) {
          //clear entire canvas
          if (x === 0 && y === 0 && width === this.width && height === this.height) {
              this.__clearCanvas();
              return;
          }
      }
      var rect, parent = this.__closestGroupOrSvg();
      rect = this.__createElement("rect", {
          x : x,
          y : y,
          width : width,
          height : height,
          fill : "#FFFFFF"
      }, true);
      this.__applyTransformation(rect)
      parent.appendChild(rect);
  }

  /**
   * Adds a linear gradient to a defs tag.
   * Returns a canvas gradient object that has a reference to it's parent def
   */
  createLinearGradient(x1, y1, x2, y2) {
      var grad = this.__createElement("linearGradient", {
          id : randomString(this.__ids),
          x1 : x1+"px",
          x2 : x2+"px",
          y1 : y1+"px",
          y2 : y2+"px",
          "gradientUnits" : "userSpaceOnUse"
      }, false);
      this.__defs.appendChild(grad);
      return new CanvasGradient(grad, this);
  }

  /**
   * Adds a radial gradient to a defs tag.
   * Returns a canvas gradient object that has a reference to it's parent def
   */
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
      var grad = this.__createElement("radialGradient", {
          id : randomString(this.__ids),
          cx : x1+"px",
          cy : y1+"px",
          r  : r1+"px",
          fx : x0+"px",
          fy : y0+"px",
          "gradientUnits" : "userSpaceOnUse"
      }, false);
      this.__defs.appendChild(grad);
      return new CanvasGradient(grad, this);

  }

  /**
   * Fills or strokes text
   * @param text
   * @param x
   * @param y
   * @param action - stroke or fill
   * @private
   */
  __applyText(text, x, y, action) {
      var el = document.createElement("span");
      el.setAttribute("style", 'font:' + this.font);

      var style = el.style, // CSSStyleDeclaration object
          parent = this.__closestGroupOrSvg(),
          textElement = this.__createElement("text", {
              "font-family": style.fontFamily,
              "font-size": style.fontSize,
              "font-style": style.fontStyle,
              "font-weight": style.fontWeight,

              // canvas doesn't support underline natively, but we do :)
              "text-decoration": this.__fontUnderline,
              "x": x,
              "y": y,
              "text-anchor": getTextAnchor(this.textAlign),
              "dominant-baseline": getDominantBaseline(this.textBaseline)
          }, true);

      textElement.appendChild(this.__document.createTextNode(text));
      this.__currentElement = textElement;
      this.__applyTransformation(textElement);
      this.__applyStyleToCurrentElement(action);

      if (this.__fontHref) {
          var a = this.__createElement("a");
          // canvas doesn't natively support linking, but we do :)
          a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.__fontHref);
          a.appendChild(textElement);
          textElement = a;
      }

      parent.appendChild(textElement);
  }

  /**
   * Creates a text element
   * @param text
   * @param x
   * @param y
   */
  fillText(text, x, y) {
      this.__applyText(text, x, y, "fill");
  }

  /**
   * Strokes text
   * @param text
   * @param x
   * @param y
   */
  strokeText(text, x, y) {
      this.__applyText(text, x, y, "stroke");
  }

  /**
   * No need to implement this for svg.
   * @param text
   * @return {TextMetrics}
   */
  measureText(text) {
      this.__ctx.font = this.font;
      return this.__ctx.measureText(text);
  }

  /**
   *  Arc command!
   */
  arc(x, y, radius, startAngle, endAngle, counterClockwise) {
      // in canvas no circle is drawn if no angle is provided.
      if (startAngle === endAngle) {
          return;
      }
      startAngle = startAngle % (2*Math.PI);
      endAngle = endAngle % (2*Math.PI);
      if (startAngle === endAngle) {
          //circle time! subtract some of the angle so svg is happy (svg elliptical arc can't draw a full circle)
          endAngle = ((endAngle + (2*Math.PI)) - 0.001 * (counterClockwise ? -1 : 1)) % (2*Math.PI);
      }
      var endX = x+radius*Math.cos(endAngle),
          endY = y+radius*Math.sin(endAngle),
          startX = x+radius*Math.cos(startAngle),
          startY = y+radius*Math.sin(startAngle),
          sweepFlag = counterClockwise ? 0 : 1,
          largeArcFlag = 0,
          diff = endAngle - startAngle;

      // https://github.com/gliffy/canvas2svg/issues/4
      if (diff < 0) {
          diff += 2*Math.PI;
      }

      if (counterClockwise) {
          largeArcFlag = diff > Math.PI ? 0 : 1;
      } else {
          largeArcFlag = diff > Math.PI ? 1 : 0;
      }

      var scaleX = Math.hypot(this.__transformMatrix.a, this.__transformMatrix.b);
      var scaleY = Math.hypot(this.__transformMatrix.c, this.__transformMatrix.d);

      this.lineTo(startX, startY);
      
      var arcCmd = tmplt("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}")
      this.__addPathCommand(arcCmd({
              rx:radius * scaleX,
              ry:radius * scaleY,
              xAxisRotation:0,
              largeArcFlag:largeArcFlag,
              sweepFlag:sweepFlag,
              endX: this.__matrixTransform(endX, endY).x,
              endY: this.__matrixTransform(endX, endY).y
          }));

      this.__currentPosition = {x: endX, y: endY};
  }

  /**
   *  Ellipse command!
   */
   ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterClockwise) {
      if (startAngle === endAngle) {
          return;
      }

      var transformedCenter = this.__matrixTransform(x, y);
      x = transformedCenter.x;
      y = transformedCenter.y;
      var scale = this.__getTransformScale();
      radiusX = radiusX * scale.x;
      radiusY = radiusY * scale.y;
      rotation = rotation + this.__getTransformRotation()

      startAngle = startAngle % (2*Math.PI);
      endAngle = endAngle % (2*Math.PI);
      if(startAngle === endAngle) {
          endAngle = ((endAngle + (2*Math.PI)) - 0.001 * (counterClockwise ? -1 : 1)) % (2*Math.PI);
      }
      var endX = x + Math.cos(-rotation) * radiusX * Math.cos(endAngle)
                   + Math.sin(-rotation) * radiusY * Math.sin(endAngle),
          endY = y - Math.sin(-rotation) * radiusX * Math.cos(endAngle)
                   + Math.cos(-rotation) * radiusY * Math.sin(endAngle),
          startX = x + Math.cos(-rotation) * radiusX * Math.cos(startAngle)
                     + Math.sin(-rotation) * radiusY * Math.sin(startAngle),
          startY = y - Math.sin(-rotation) * radiusX * Math.cos(startAngle)
                     + Math.cos(-rotation) * radiusY * Math.sin(startAngle),
          sweepFlag = counterClockwise ? 0 : 1,
          largeArcFlag = 0,
          diff = endAngle - startAngle;

      if(diff < 0) {
          diff += 2*Math.PI;
      }

      if(counterClockwise) {
          largeArcFlag = diff > Math.PI ? 0 : 1;
      } else {
          largeArcFlag = diff > Math.PI ? 1 : 0;
      }

      // Transform is already applied, so temporarily remove since lineTo
      // will apply it again.
      var currentTransform = this.__transformMatrix;
      this.resetTransform();
      this.lineTo(startX, startY);
      this.__transformMatrix = currentTransform;
      var ellipseCmd = tmplt("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}")
      this.__addPathCommand(ellipseCmd({
              rx:radiusX, 
              ry:radiusY, 
              xAxisRotation:rotation*(180/Math.PI), 
              largeArcFlag:largeArcFlag, 
              sweepFlag:sweepFlag, 
              endX:endX,
              endY:endY
          }));

      this.__currentPosition = {x: endX, y: endY};
  }

  /**
   * Generates a ClipPath from the clip command.
   */
  clip() {
      var group = this.__closestGroupOrSvg(),
          clipPath = this.__createElement("clipPath"),
          id =  randomString(this.__ids),
          newGroup = this.__createElement("g");

      this.__applyCurrentDefaultPath();
      group.removeChild(this.__currentElement);
      clipPath.setAttribute("id", id);
      clipPath.appendChild(this.__currentElement);

      this.__defs.appendChild(clipPath);

      //set the clip path to this group
      group.setAttribute("clip-path", tmplt("url(#{id})", {id:id}));

      //clip paths can be scaled and transformed, we need to add another wrapper group to avoid later transformations
      // to this path
      group.appendChild(newGroup);

      this.__currentElement = newGroup;

  }

  /**
   * Draws a canvas, image or mock context to this canvas.
   * Note that all svg dom manipulation uses node.childNodes rather than node.children for IE support.
   * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
   */
  drawImage() {
      //convert arguments to a real array
      var args = Array.prototype.slice.call(arguments),
          image=args[0],
          dx, dy, dw, dh, sx=0, sy=0, sw, sh, parent, svg, defs, group,
          currentElement, svgImage, canvas, context, id;

      if (args.length === 3) {
          dx = args[1];
          dy = args[2];
          sw = image.width;
          sh = image.height;
          dw = sw;
          dh = sh;
      } else if (args.length === 5) {
          dx = args[1];
          dy = args[2];
          dw = args[3];
          dh = args[4];
          sw = image.width;
          sh = image.height;
      } else if (args.length === 9) {
          sx = args[1];
          sy = args[2];
          sw = args[3];
          sh = args[4];
          dx = args[5];
          dy = args[6];
          dw = args[7];
          dh = args[8];
      } else {
          throw new Error("Invalid number of arguments passed to drawImage: " + arguments.length);
      }

      parent = this.__closestGroupOrSvg();
      currentElement = this.__currentElement;
      const matrix = this.getTransform().translate(dx, dy);
      if (image instanceof Context) {
          //canvas2svg mock canvas context. In the future we may want to clone nodes instead.
          //also I'm currently ignoring dw, dh, sw, sh, sx, sy for a mock context.
          svg = image.getSvg().cloneNode(true);
          if (svg.childNodes && svg.childNodes.length > 1) {
              defs = svg.childNodes[0];
              while(defs.childNodes.length) {
                  id = defs.childNodes[0].getAttribute("id");
                  this.__ids[id] = id;
                  this.__defs.appendChild(defs.childNodes[0]);
              }
              group = svg.childNodes[1];
              if (group) {
                  this.__applyTransformation(group, matrix);
                  parent.appendChild(group);
              }
          }
      } else if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
          //canvas or image
          svgImage = this.__createElement("image");
          svgImage.setAttribute("width", dw);
          svgImage.setAttribute("height", dh);
          svgImage.setAttribute("preserveAspectRatio", "none");

          if (sx || sy || sw !== image.width || sh !== image.height) {
              //crop the image using a temporary canvas
              canvas = this.__document.createElement("canvas");
              canvas.width = dw;
              canvas.height = dh;
              context = canvas.getContext("2d");
              context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
              image = canvas;
          }
          this.__applyTransformation(svgImage, matrix);
          svgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
              image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
          parent.appendChild(svgImage);
      }
  }

  /**
   * Generates a pattern tag
   */
  createPattern(image, repetition) {
      var pattern = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"),
          id = randomString(this.__ids),
          img;
      pattern.setAttribute("id", id);
      pattern.setAttribute("width", image.width);
      pattern.setAttribute("height", image.height);
      // We want the pattern sizing to be absolute, and not relative
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Patterns
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/patternUnits
      pattern.setAttribute("patternUnits", "userSpaceOnUse");

      if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
          img = this.__document.createElementNS("http://www.w3.org/2000/svg", "image");
          img.setAttribute("width", image.width);
          img.setAttribute("height", image.height);
          img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
              image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
          pattern.appendChild(img);
          this.__defs.appendChild(pattern);
      } else if (image instanceof Context) {
          pattern.appendChild(image.__root.childNodes[1]);
          this.__defs.appendChild(pattern);
      }
      return new CanvasPattern(pattern, this);
  }

  setLineDash(dashArray) {
      if (dashArray && dashArray.length > 0) {
          this.lineDash = dashArray.join(",");
      } else {
          this.lineDash = null;
      }
  }

  /**
   * SetTransform changes the current transformation matrix to
   * the matrix given by the arguments as described below.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
   */
  setTransform(a, b, c, d, e, f) {
      if (a instanceof DOMMatrix) {
          this.__transformMatrix = new DOMMatrix([a.a, a.b, a.c, a.d, a.e, a.f]);
      } else {
          this.__transformMatrix = new DOMMatrix([a, b, c, d, e, f]);
      }
  }

  /**
   * GetTransform Returns a copy of the current transformation matrix,
   * as a newly created DOMMAtrix Object
   *
   * @returns A DOMMatrix Object
   */
  getTransform() {
      let {a, b, c, d, e, f} = this.__transformMatrix;
      return new DOMMatrix([a, b, c, d, e, f]);
  }

  /**
   * ResetTransform resets the current transformation matrix to the identity matrix
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/resetTransform
   */
  resetTransform() {
      this.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Add the scaling transformation described by the arguments to the current transformation matrix.
   *
   * @param x The x argument represents the scale factor in the horizontal direction
   * @param y The y argument represents the scale factor in the vertical direction.
   * @see https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-scale
   */
  scale(x, y) {
      if (y === undefined) {
          y = x;
      }
      // If either of the arguments are infinite or NaN, then return.
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
          return
      }
      let matrix = this.getTransform().scale(x, y);
      this.setTransform(matrix);
  }

  /**
   * Rotate adds a rotation to the transformation matrix.
   *
   * @param angle The rotation angle, clockwise in radians. You can use degree * Math.PI / 180 to calculate a radian from a degree.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
   * @see https://www.w3.org/TR/css-transforms-1
   */
  rotate(angle) {
      let matrix = this.getTransform().multiply(new DOMMatrix([
          Math.cos(angle),
          Math.sin(angle),
          -Math.sin(angle),
          Math.cos(angle),
          0,
          0
      ]))
      this.setTransform(matrix);
  }

  /**
   * Translate adds a translation transformation to the current matrix.
   *
   * @param x Distance to move in the horizontal direction. Positive values are to the right, and negative to the left.
   * @param y Distance to move in the vertical direction. Positive values are down, and negative are up.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/translate
   */
  translate(x, y) {
      const matrix = this.getTransform().translate(x, y);
      this.setTransform(matrix);
  }

  /**
   * Transform multiplies the current transformation with the matrix described by the arguments of this method.
   * This lets you scale, rotate, translate (move), and skew the context.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
   */
  transform(a, b, c, d, e, f) {
      const matrix = this.getTransform().multiply(new DOMMatrix([a, b, c, d, e, f]));
      this.setTransform(matrix);
  }

  __matrixTransform(x, y) {
      return new DOMPoint(x, y).matrixTransform(this.__transformMatrix)
  }

  /**
   * 
   * @returns The scale component of the transform matrix as {x,y}.
   */
  __getTransformScale() {
      return {
          x: Math.hypot(this.__transformMatrix.a, this.__transformMatrix.b),
          y: Math.hypot(this.__transformMatrix.c, this.__transformMatrix.d)
      };
  }

  /**
   * 
   * @returns The rotation component of the transform matrix in radians.
   */
  __getTransformRotation() {
      return Math.atan2(this.__transformMatrix.b, this.__transformMatrix.a);
  }

  /**
   *
   * @param {*} sx The x-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
   * @param {*} sy The y-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
   * @param {*} sw The width of the rectangle from which the ImageData will be extracted. Positive values are to the right, and negative to the left.
   * @param {*} sh The height of the rectangle from which the ImageData will be extracted. Positive values are down, and negative are up.
   * @param {Boolean} options.async Will return a Promise<ImageData> if true, must be set to true
   * @returns An ImageData object containing the image data for the rectangle of the canvas specified. The coordinates of the rectangle's top-left corner are (sx, sy), while the coordinates of the bottom corner are (sx + sw, sy + sh).
   */
  getImageData(sx, sy, sw, sh, options) {
      return imageUtils.getImageData(this.getSvg(), this.width, this.height, sx, sy, sw, sh, options);
  }

  /**
   * Not yet implemented
   */
  drawFocusRing() {}
  createImageData() {}
  putImageData() {}
  globalCompositeOperation() {}
}
