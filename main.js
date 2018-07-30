var W = window.innerWidth, H = window.innerHeight;
var canvas;
var ctx;
var elements = [];
var cam_pos = {
	f_x:0,
	f_y:-50,
	f_z:-150,
	x:0,
	y:0,
	z:0,
	rx:0,
	ry:Math.PI,
	rz:0,
	f:2,
}
var face_list = [];
let test_i = 0;
class Rectangle {
	constructor(x, y, z, w, h, d, context){
		this.x = x;
		this.y = y;
		this.z = z;
		this.width = w;
		this.depth = d;
		this.height = h;
		this.context = context;
		this.faces = [
			['front', [[this.x, this.y+this.height, this.z], [this.x+this.width, this.y+this.height, this.z],[this.x+this.width, this.y, this.z],[this.x, this.y, this.z]], rand_col()],
			['left', [[this.x, this.y+this.height, this.z+this.depth], [this.x, this.y+this.height, this.z],[this.x, this.y, this.z],[this.x, this.y, this.z+this.depth]], rand_col()],
			['back', [[this.x, this.y+this.height, this.z+this.depth], [this.x+this.width, this.y+this.height, this.z+this.depth],[this.x+this.width, this.y, this.z+this.depth],[this.x, this.y, this.z+this.depth]], rand_col()],
			['right', [[this.x+this.width, this.y+this.height, this.z+this.depth], [this.x+this.width, this.y+this.height, this.z],[this.x+this.width, this.y, this.z],[this.x+this.width, this.y, this.z+this.depth]], rand_col()],
			['top', [[this.x, this.y+this.height, this.z], [this.x+this.width, this.y+this.height, this.z],[this.x+this.width, this.y+this.height, this.z+this.depth],[this.x, this.y+this.height, this.z+this.depth]], rand_col()],
			['bottom', [[this.x, this.y, this.z], [this.x+this.width, this.y, this.z],[this.x+this.width, this.y, this.z+this.depth],[this.x, this.y, this.z+this.depth]], rand_col()],
		]
		this.colors ={
			'front': rand_col(),
			'left': rand_col(),
			'back': rand_col(),
			'right': rand_col(),
			'top': rand_col(),
			'bottom': rand_col(),
		}
		this.cam_dist = 0;
	}
	sort_faces(){
		let avg_sum = 0;
		let num_summed = 0;
		this.faces.sort(function(a, b){
			let sum_a = 0;
			let sum_b = 0;
			for(let v in a[1]){
				let vertex = a[1][v];
				sum_a += Math.sqrt(Math.pow(vertex[0] - cam_pos.f_x, 2) + Math.pow(vertex[1] - cam_pos.f_y, 2) + Math.pow(vertex[2] - cam_pos.f_z, 2));
			}
			for(let v in b[1]){
				let vertex = b[1][v];
				sum_b += Math.sqrt(Math.pow(vertex[0] - cam_pos.f_x, 2) + Math.pow(vertex[1] - cam_pos.f_y, 2) + Math.pow(vertex[2] - cam_pos.f_z, 2));
			}
			avg_sum += (sum_a + sum_b);
			num_summed += 2;
			return (sum_a/a[1].length) - (sum_b/b[1].length);
		});
		this.cam_dist = avg_sum/num_summed
		return this.cam_dist;
	}
	draw(){
		//Front

		for (let s in this.faces){
			let name = this.faces[s][0];
			let side = this.faces[s][1];
			this.context.fillStyle = this.colors[name];

			console.log('side');
			console.log(side[0]);
			console.log(cam_to_IP(world_to_cam(side[0])));
			let num_outside = 0;
			this.context.beginPath();

			this.context.moveTo(cam_to_IP(world_to_cam(side[0]))[0], cam_to_IP(world_to_cam(side[0]))[1]);
			for(let v = 1; v < side.length; v++){
				let n_x = screen_constrain(cam_to_IP(world_to_cam(side[v]))[0], W);
				let n_y = screen_constrain(cam_to_IP(world_to_cam(side[v]))[1], H);
				this.context.lineTo(n_x[0], n_y[0]);
				if(n_x[1] || n_y[1]){
					num_outside += 1
				}
			}
			
			this.context.lineTo(cam_to_IP(world_to_cam(side[0]))[0], cam_to_IP(world_to_cam(side[0]))[1]);
			this.context.fill()
		}
		
	}

	randomize_colors(){
		this.colors ={
			'front': rand_col(),
			'left': rand_col(),
			'back': rand_col(),
			'right': rand_col(),
			'top': rand_col(),
			'bottom': rand_col(),
		}	
	}
}
function screen_constrain(v, max){
	ret_val = Math.max(Math.min(max, v), 0)
	return [ret_val, ret_val != v];
}
function cam_t(){
	let x = cam_pos.f_x;
	let y = cam_pos.f_y;
	let z = cam_pos.f_z;
	let c_x = (Math.cos(cam_pos.ry)*Math.cos(cam_pos.rz))*x + (Math.cos(cam_pos.ry)*Math.sin(cam_pos.rz))*y + (-1*Math.sin(cam_pos.ry))*z;
	let c_y = (Math.sin(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.cos(cam_pos.rz) - Math.cos(cam_pos.rx)*Math.sin(cam_pos.rz))*x + (Math.sin(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.sin(cam_pos.rz) + Math.cos(cam_pos.rx)*Math.cos(cam_pos.rz))*y + (Math.sin(cam_pos.rx)*Math.cos(cam_pos.ry))*z;
	let c_z = (Math.cos(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.cos(cam_pos.rz) + Math.sin(cam_pos.rx)*Math.sin(cam_pos.rz))*x + (Math.cos(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.sin(cam_pos.rz) - Math.sin(cam_pos.rx)*Math.cos(cam_pos.rz))*y + (Math.cos(cam_pos.rx)*Math.cos(cam_pos.ry))*z;
	cam_pos.x = c_x;
	cam_pos.y = c_y;
	cam_pos.z = c_z;


}
function world_to_cam(p){
	let x = p[0];
	let y = p[1];
	let z = p[2];
	let c_x = (Math.cos(cam_pos.ry)*Math.cos(cam_pos.rz))*x + (Math.cos(cam_pos.ry)*Math.sin(cam_pos.rz))*y + (-1*Math.sin(cam_pos.ry))*z + cam_pos.x;
	let c_y = (Math.sin(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.cos(cam_pos.rz) - Math.cos(cam_pos.rx)*Math.sin(cam_pos.rz))*x + (Math.sin(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.sin(cam_pos.rz) + Math.cos(cam_pos.rx)*Math.cos(cam_pos.rz))*y + (Math.sin(cam_pos.rx)*Math.cos(cam_pos.ry))*z + cam_pos.y;
	let c_z = (Math.cos(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.cos(cam_pos.rz) + Math.sin(cam_pos.rx)*Math.sin(cam_pos.rz))*x + (Math.cos(cam_pos.rx)*Math.sin(cam_pos.ry)*Math.sin(cam_pos.rz) - Math.sin(cam_pos.rx)*Math.cos(cam_pos.rz))*y + (Math.cos(cam_pos.rx)*Math.cos(cam_pos.ry))*z + cam_pos.z;
	return [c_x, c_y, c_z];
}

function cam_to_IP(p){
	let x = p[0];
	let y = p[1];
	let z = p[2];
	if(Math.abs(z) > 1){
		return [(x/z * cam_pos.f)/0.004 + W/2,  (-1*y/z * cam_pos.f)/0.004 + H/2]
	}else{
		return [W/2, H/2];
	}
	
}
function update_screen(){
	ctx.fillStyle = rand_col();
	ctx.clearRect(0,0,W,H);

	face_list.sort(function(a, b){
		let sum_a = 0;
		let sum_b = 0;
		for(let v in a[1]){
			let vertex = a[1][v];
			sum_a += Math.sqrt(Math.pow(vertex[0] - cam_pos.f_x, 2) + Math.pow(vertex[1] - cam_pos.f_y, 2) + Math.pow(vertex[2] - cam_pos.f_z, 2));
			//break;
		}
		for(let v in b[1]){
			let vertex = b[1][v];
			sum_b += Math.sqrt(Math.pow(vertex[0] - cam_pos.f_x, 2) + Math.pow(vertex[1] - cam_pos.f_y, 2) + Math.pow(vertex[2] - cam_pos.f_z, 2));
			//break;
		}
		return (sum_a/a[1].length) - (sum_b/b[1].length);
	});
	for(let s in face_list){
		let name = face_list[s][0];
		let side = face_list[s][1];
		ctx.fillStyle = face_list[s][2];

		let num_outside = 0;
		ctx.beginPath();

		ctx.moveTo(cam_to_IP(world_to_cam(side[0]))[0], cam_to_IP(world_to_cam(side[0]))[1]);
		for(let v = 1; v < side.length; v++){
			let n_x = screen_constrain(cam_to_IP(world_to_cam(side[v]))[0], W);
			let n_y = screen_constrain(cam_to_IP(world_to_cam(side[v]))[1], H);
			ctx.lineTo(n_x[0], n_y[0]);
			if(n_x[1] || n_y[1]){
				num_outside += 1
			}
		}
		
		ctx.lineTo(cam_to_IP(world_to_cam(side[0]))[0], cam_to_IP(world_to_cam(side[0]))[1]);
		ctx.fill()
	}
	// for(let el in elements){
	// 	elements[el].sort_faces();
	// }
	// elements.sort(function(a, b){
	// 	return a.cam_dist - b.cam_dist;
	// })
	// for(let el in elements){

	// 	elements[el].draw();
	// }
	//window.requestAnimationFrame(update_screen);
}
window.onload = function(){

	// Setup Canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	canvas.width = W;
	canvas.height = H;
	

   document.onkeypress = function(e){
		e =e || window.event;
		//alert(e.keyCode);
        if(e.key == 's'){
			cam_pos.f_z -= 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'w'){
			cam_pos.f_z += 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'a'){
			cam_pos.f_x -= 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'd'){
			cam_pos.f_x += 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'r'){
			cam_pos.f_y += 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'f'){
			cam_pos.f_y -= 2;
			cam_t();
			update_screen();
        }
        if(e.key == 'q'){
			cam_pos.ry -= 0.02;
			cam_t();
			update_screen();
        }
        if(e.key == 'e'){
			cam_pos.ry += 0.02;
			cam_t();
			update_screen();
        }
        if(e.key == 't'){
			cam_pos.rx += 0.02;
			cam_t();
			update_screen();
        }
        if(e.key == 'g'){
			cam_pos.rx -= 0.02;
			cam_t();
			update_screen();
        }
        if(e.keyCode == 32){
			elements[test_i].randomize_colors();
			update_screen();
			test_i += 1;
		}
		
	}
	let s = 10;
	for(let r = 0; r < 4; r++){
		for(let c = 0; c < 4; c++){
			elements.push(new Rectangle(r*s, 0, c*s, s, s, s, ctx));
		}
	}
	///elements.push(new Rectangle(0,-10,0, 1000, 10, 100, ctx));
	for(let el in elements){
		face_list = face_list.concat(elements[el].faces);
	}
	
	// elements.push(new Rectangle(20,0,0, 10, 10, 10, ctx));
	// elements.push(new Rectangle(20,0,30, 10, 10, 10, ctx));
	cam_t();
	window.requestAnimationFrame(update_screen);
}

function rand_col(){
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgba(${r},${g},${b}, 1)`;
}