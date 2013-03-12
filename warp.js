/**
 * Creates an instance of Warp
 * 
 * @constructor
 * @param {Object} settings Has to contain `input_canvas` pointing to an html canvas element
 *                          `viewport_canvas` pointing to an html canvas element,
 *                          (optional) top, left viewport position
 *
 */
var Warp = function (options) {
	this.options = options;
	this._init();
};

Warp.prototype = {
	/**
	 * Called from constructor, prepares internal state
	 * 
	 * @private
	 *
	 */
	_init: function () {
		this.input_canvas = this.options.input_canvas;
		$(this.input_canvas).hide();
		
		this.ctx = this.input_canvas.getContext('2d');
		this.w = this.input_canvas.width;
		this.h = this.input_canvas.height;

		this.output_w = this.options.viewport_canvas.width; 
		this.output_h = this.options.viewport_canvas.height; 
	},
	
	/**
	 * Calculates distance to `this.center`
	 * 
	 * @private
	 * @param {number} x coordinate to calculate distance to
	 * @param {number} y coordinate to calculate distance to
	 *
	 */
	_distance: function(x, y) {
		var xd = this.center.x - x;
		var yd = this.center.y - y;

		var d = Math.sqrt( (xd * xd) + (yd * yd) );

		return d;
	},

	/**
	 * Default function (can be overriden) which controls the deformation
	 * in terms of distance to origin (center)
	 * 
	 * @param {number} d from 0.0 to 1.0 telling how far along are we from the center (0.0 in the center, 1.0 at the edge of warp radius)
	 * @return {number} from 0.0 to 1.0 telling how much to rotate at this distance (0.0 no rotation, 1.0 full rotation)
	 * @memberOf logger
	 *
	 */
	func: function(d) {
		// linear
		return 1.0 - d;
	},

	/**
	 * Performs actual deformation, copying pixels around in a buffer array,
	 * then back to input image.
	 *
	 * @param {object} settings should contain the following parameters:
	 *                 center (x, y),
	 *                 angle (deg),
	 *                 radius (px),
	 *                 optionally a func() to override the default
	 *                 optionally copy_input flag if the input canvas should be copied to output before deformation
	 *
	 */
	deform: function (settings) {
		// store variables used by other private Warp functions
		this.center = settings.center;


		// deg2rad
		settings.angle = settings.angle * Math.PI / 180;
		
		var input_img = this.ctx.getImageData(0, 0, this.w, this.h);
		
		var output_ctx = this.options.viewport_canvas.getContext('2d');
		
		// copy the input image in case the deformation doesn't occupy
		// whole viewport canvas
		if (settings.copy_input)
		{
			output_ctx.drawImage( this.input_canvas,
					-this.options.left, -this.options.top );
		}
		
		var output_img = output_ctx.getImageData(0, 0,
						this.output_w, this.output_h);
		
		var func = settings.func || this.func;
		
		var angle, dist, inp_x, inp_y, x, y;
		for( y = 0; y < this.output_h; y++ ) {
			for( x = 0; x < this.output_w; x++ ) {
				// calc position in input canvas
				inp_x = x + this.options.left;
				inp_y = y + this.options.top;

				dist = this._distance(inp_x, inp_y);

				if (dist < settings.radius)
				{
					// calc amount of rotation at this
					// distance (according to provided func())
					angle = settings.angle * 
						func(dist / settings.radius);

					// pass the distance to avoid calculating
					// it yet again in the function
					this._warp_pixel( input_img, output_img, 
							inp_x, inp_y, x, y,
							angle, dist );
				}
			}
		}
		
		output_ctx.putImageData( output_img, 0, 0 );
		input_img = output_img = null;
	},

	/**
	 * Warps one pixel around according to `angle`
	 * 
	 * @private
	 * @param {object} input_img source image
	 * @param {object} output_img destination image
	 * @param {number} inp_x source pixel x coordinate (i.e. taken from input_img)
	 * @param {number} inp_y source pixel y coordinate (i.e. taken from input_img)
	 * @param {number} x destination pixel x coordinate (i.e. this is where the source pixel will land)
	 * @param {number} y destination pixel y coordinate (i.e. this is where the source pixel will land)
	 * @param {number} angle rotation angle
	 * @param {number} dist (optional) distance to center of deformation
	 * 
	 */
	_warp_pixel: function ( input_img, output_img,
				inp_x, inp_y, x, y, angle, dist ) {
		var r = dist || this._distance(inp_x, inp_y);
		
		var a = Math.atan2(inp_y - this.center.y, inp_x - this.center.x);
		angle += a;

		// compute the pixel to copy from
		// "| 0" clamps to int
		var src_x = this.center.x + Math.cos(angle) * r | 0;
		var src_y = this.center.y + Math.sin(angle) * r | 0;

		// calculate actual positions in pixel arrays
		var src_pos = (src_y * this.w + src_x) * 4;
		var dest_pos = (y * this.output_w + x) * 4;
	
		// finish if we fall outside the boundary of original canvas
		if (
			src_x > this.w ||
			src_x < 0 ||
			src_pos > input_img.data.length ||
			src_pos < 0)
		{
			return;
		}
		
		// copy all 4 pixel bytes (RGBA)
		for (var i = 0; i < 4; i++)
			output_img.data[dest_pos + i] = input_img.data[src_pos + i];
	}

};
