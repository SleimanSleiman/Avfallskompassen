export function autoRotateContainer(
    container: { x: number; y: number; width: number; height: number },
    roomX: number,
    roomY: number,
    roomWidth: number,
    roomHeight: number
) {
    const { x, y, width, height } = container;
    const TOL = 60;

    const leftDist = x - roomX;
    const rightDist = (roomX + roomWidth) - (x + width);
    const topDist = y - roomY;
    const bottomDist = (roomY + roomHeight) - (y + height);

    const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

    if (minDist > TOL) return null;

    let intended: number;
    if (minDist === leftDist) intended = 0; // right
    else if (minDist === rightDist) intended = 180; 
    else if (minDist === topDist) intended = 90; 
    else intended = 270;

    switch (intended) {
        case 0:   return 270; // left wall → face left
        case 180: return 90;  // right wall → face right
        case 90:  return 0;   // top wall → face up
        case 270: return 180; // bottom wall → face down
    }

    return null;
}
