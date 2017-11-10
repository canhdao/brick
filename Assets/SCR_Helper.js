static var Z_PLANE = 8;
static var RAD_TO_DEG = 57.29577951308231;
static var DEG_TO_RAD = 0.0174532925199433;

static function DistanceBetweenTwoPoint (x1 : float, y1 : float, x2 : float, y2 : float) {
	return Mathf.Sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

static function AngleBetweenTwoPoint (x1 : float, y1 : float, x2 : float, y2 : float) {
	var angle = 0;
	if (y2 == y1) {
		if (x2 > x1)
			angle = 90;
		else if (x2 < x1)
			angle = 270;
	}
	else {
		angle = Mathf.Atan((x2 - x1) / (y2 - y1)) * RAD_TO_DEG;
		if (y2 < y1) {
			angle += 180;
		}
		if (angle < 0) angle += 360;
	}

	return angle;
}

static function Sin (angle : float) {
	return Mathf.Sin(angle * DEG_TO_RAD);
}

static function Cos (angle : float) {
	return Mathf.Cos(angle * DEG_TO_RAD);
}
