export default {
  NONE: {
    frag: `
          precision mediump float;
          varying vec2 uv;
          uniform sampler2D inputImageTexture;
          void main()
          {
             vec3 img = texture2D(inputImageTexture, uv).rgb;
             gl_FragColor = vec4(img, 1.);
          }
       `,
    textures: {}
  },
  ALTAIR: {
    frag: `
          precision mediump float;
          varying vec2 uv;
          uniform sampler2D inputImageTexture;
          uniform sampler2D inputImageTexture2;
          const vec3 W = vec3(0.2125, 0.7154, 0.0721);

          vec3 BrightnessContrastSaturation(vec3 color, float brt, float con, float sat)
          {
            vec3 black = vec3(0., 0., 0.);
            vec3 middle = vec3(0.5, 0.5, 0.5);
            float luminance = dot(color, W);
            vec3 gray = vec3(luminance, luminance, luminance);

            vec3 brtColor = mix(black, color, brt);
            vec3 conColor = mix(middle, brtColor, con);
            vec3 satColor = mix(gray, conColor, sat);
            return satColor;
          }

          vec3 ovelayBlender(vec3 Color, vec3 filter){
            vec3 filter_result;
            float luminance = dot(filter, W);

            if(luminance < 0.5)
              filter_result = 2. * filter * Color;
            else
              filter_result = 1. - (1. - (2. *(filter - 0.5)))*(1. - Color);

            return filter_result;
          }

          void main()
          {
             //get the pixel
               vec2 st = uv.st;
               vec3 irgb = texture2D(inputImageTexture, st).rgb;
               vec3 filter = texture2D(inputImageTexture2, st).rgb;

               //adjust the brightness/contrast/saturation
               float T_bright = 1.1;
               float T_contrast = 1.1;
               float T_saturation = 1.3;
               vec3 bcs_result = BrightnessContrastSaturation(irgb, T_bright, T_contrast, T_saturation);

               //add filter (overlay blending)
               vec3 after_filter = mix(bcs_result, ovelayBlender(bcs_result, filter), 0.3);

               gl_FragColor = vec4(after_filter, 1.);
          }
        `,
    textures: {
      inputImageTexture2: require('image!filters-filter2')
    }
  },
  VEGA: {
    frag: `
          precision highp float;

          varying vec2 uv;

          uniform sampler2D inputImageTexture;
          uniform sampler2D inputImageTexture2; //map
          uniform sampler2D inputImageTexture3; //gradMap

          mat3 saturateMatrix = mat3(
                                    1.1402,
                                    -0.0598,
                                    -0.061,
                                    -0.1174,
                                    1.0826,
                                    -0.1186,
                                    -0.0228,
                                    -0.0228,
                                    1.1772);

          vec3 lumaCoeffs = vec3(.3, .59, .11);

          void main()
          {
             vec3 texel = texture2D(inputImageTexture, uv).rgb;

             texel = vec3(
                          texture2D(inputImageTexture2, vec2(texel.r, .1666666)).r,
                          texture2D(inputImageTexture2, vec2(texel.g, .5)).g,
                          texture2D(inputImageTexture2, vec2(texel.b, .8333333)).b
                          );

             texel = saturateMatrix * texel;
             float luma = dot(lumaCoeffs, texel);
             texel = vec3(
                          texture2D(inputImageTexture3, vec2(luma, texel.r)).r,
                          texture2D(inputImageTexture3, vec2(luma, texel.g)).g,
                          texture2D(inputImageTexture3, vec2(luma, texel.b)).b);

             gl_FragColor = vec4(texel, 1.0);
          }
        `,
    textures: {
      inputImageTexture2: require('image!filters-valencia-map'),
      inputImageTexture3: require('image!filters-hefe-gradient-map')
    }
  },
  POLARIS: {
    frag: `
          precision mediump float;
          uniform sampler2D inputImageTexture;
          uniform sampler2D inputImageTexture2;
          varying vec2 uv;
          const vec3 W = vec3(0.2125, 0.7154, 0.0721);

          vec3 BrightnessContrastSaturation(vec3 color, float brt, float con, float sat)
          {
            vec3 black = vec3(0., 0., 0.);
            vec3 middle = vec3(0.5, 0.5, 0.5);
            float luminance = dot(color, W);
            vec3 gray = vec3(luminance, luminance, luminance);

            vec3 brtColor = mix(black, color, brt);
            vec3 conColor = mix(middle, brtColor, con);
            vec3 satColor = mix(gray, conColor, sat);
            return satColor;
          }

          vec3 ovelayBlender(vec3 Color, vec3 filter){
            vec3 filter_result;

            //if(luminance < 0.5)
            //	filter_result = 2. * trans_filter * Color;
            //else
              filter_result = 1. - (1. - (2. *(filter - 0.5)))*(1. - Color);

            return filter_result;
          }

          void main()
          {
             //get the pixel
               vec2 st = uv.st;
               vec3 irgb = texture2D(inputImageTexture, st).rgb;
               vec3 filter = texture2D(inputImageTexture2, st).rgb;

               //adjust the brightness/contrast/saturation
               float T_bright = 1.0;
               float T_contrast = 1.0;
               float T_saturation = 1.0;
               vec3 bcs_result = BrightnessContrastSaturation(irgb, T_bright, T_contrast, T_saturation);

               //more red
               vec3 rb_result = vec3(bcs_result.r*1.3, bcs_result.g, bcs_result.b*0.9);

               //add filter (overlay blending)
               vec3 after_filter = mix(bcs_result, ovelayBlender(bcs_result, filter), 0.55);

               gl_FragColor = vec4(after_filter, 1.);
          }
          `,
    textures: {
      inputImageTexture2: require('image!filters-toaster')
    }
  },
  SIRIUS: {
    frag: `
             precision lowp float;

             varying highp vec2 uv;

             uniform sampler2D inputImageTexture;
             uniform sampler2D inputImageTexture2; //map
             uniform sampler2D inputImageTexture3; //vigMap

             void main()
             {

                 vec3 texel = texture2D(inputImageTexture, uv).rgb;

                 vec2 tc = (2.0 * uv) - 1.0;
                 float d = dot(tc, tc);
                 vec2 lookup = vec2(d, texel.r);
                 texel.r = texture2D(inputImageTexture3, lookup).r;
                 lookup.y = texel.g;
                 texel.g = texture2D(inputImageTexture3, lookup).g;
                 lookup.y = texel.b;
                 texel.b	= texture2D(inputImageTexture3, lookup).b;

                 vec2 red = vec2(texel.r, 0.16666);
                 vec2 green = vec2(texel.g, 0.5);
                 vec2 blue = vec2(texel.b, .83333);
                 texel.r = texture2D(inputImageTexture2, red).r;
                 texel.g = texture2D(inputImageTexture2, green).g;
                 texel.b = texture2D(inputImageTexture2, blue).b;

                 gl_FragColor = vec4(texel, 1.0);

             }
          `,
    textures: {
      inputImageTexture2: require('image!filters-xpro-map'),
      inputImageTexture3: require('image!filters-vignette-map')
    }
  }
}
