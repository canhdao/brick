private var material = new Array();
private var countDown = new Array();

function Start() {
	
}

function SetColor (mat:Material, count:float) {
	material.push (mat);
	countDown.push (count);
}

function Update() {
	var dt = Time.deltaTime;
	for (var i=0; i<countDown.length; i++) {
		var count:float = countDown[i];
		if (count > 0) {
			count -= dt;
			countDown[i] = count;
			if (count <= 0) {
				gameObject.GetComponent(Renderer).material = material[i];
				material.splice(i, 1);
				countDown.splice(i, 1);
			}
		}
	}
}
