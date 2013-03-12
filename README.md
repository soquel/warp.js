Warp.js
=======

A simple canvas *warp* deformation in JavaScript. A graphics effects doing
"pinch and rotate" of the canvas. All the basic control parameters are available. 
Combine with animations to do cool effects. Here are some 
[live demos and more documentation](http://www.tinkeringwithstuff.com/posts/canvas-warping-with-javascript.html).


![warp effect](https://raw.github.com/soquel/warp.js/master/warp_example1.png "Basic Warp Effect")



## Basic Usage

You will need two canvas elements, an  *input* one, and *viewport* one.
*viewport* should probably be smaller than *input* since you will want to have 
enough room around for the effect to grab the pixels from (in case the warping
stretches beyond the size of viewport).

Create a new *Warp* object providing it with those canvas elements, plus *top* and *left* 
coordinates for the viewport (i.e. where it is virtually placed on the *input* canvas).

Draw your stuff on the *input* canvas, then call *deform()* supplying actual 
warping parameters: *center*, *radius* and *angle*.


```javascript
// assuming you have jQuery
var warp = new Warp({
	input_canvas: $('#input_canvas').get(0),
	viewport_canvas: $('#viewport_canvas').get(0),
	top: 100,
	left: 100
});

warp.deform({
	center: {x: 100, y: 100},
	radius: 50,
	angle: 45
});
```

Additionally you can also provide the transformation function, which determines
how the rotation angle changes with distance to the origin of deformation.

```javascript
warp.deform({
	center: {x: 100, y: 100},
	radius: 50,
	angle: 90,
	func: function (d) { return 1 + Math.sin( (d + 2) * Math.PI / 2 ) }
});
```


The function takes one floating point argument from 0.0 to 1.0, being 
the distance from origin (0.0 is the center of warping, 1.0 the edge of it) 
and returns a value between 0.0 and 1.0 representing the relative angle of rotation 
at this distance (0.0 being no rotation at all, 1.0 being the full *angle*). That 
means you probably want a function *f* which satisfies the following conditions:

*f(0) = 1*  (meaning at the center of warping make full rotation)

*f(1) = 0*  (meaning at the edge of warping make no rotation at all)




### Example custom functions

Here are a few example custom functions you can use.
Refer to my blog post about this effect for a more visual explanation of custom
functions: http://www.tinkeringwithstuff.com/posts/canvas-warping-with-javascript.html

  * Just rotate by *angle*. That will look like a cut-out since every pixel
    inside the *radius* will be rotated by the same angle, irrespective of its
    distance to the center of deformation:

    ```javascript
    function(d) {
        return 1;
    }
    ```
    
  * Linear. This will linearly "interpolate" the rotation angle from no 
    rotation at the edge to full rotation in the origin. That's the default if
    you don't provide a custom function and looks like a basic warp:

    ```javascript
    function(d) {
        return 1.0 - d;
    }
    ```

  * Sine. Smooth start and smooth end, like an S-shaped curve:

    ```javascript
    function(d) {
        return 0.5 + Math.sin( (d + 0.5) * Math.PI ) / 2;
    }
    ```

  * Sine 2. Smooth and slow start, sharp end:

    ```javascript
    function(d) {
        return 1 + Math.sin( (d + 2) * Math.PI / 2 );
    }
    ```

## License

Do-whatever-you-want-with-it license.

