/**
 * ContainerImage Component
 * Renders the visual representation of a container:
 * - Uses the container image if loaded
 * - Falls back to a colored rectangle if image loading fails
 */

import { Group, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { ContainerInRoom } from "../../../../lib/Types";
import lidIconUrl from "../../../../../../assets/lid_icon.png";

export default function ContainerImage({
    container,
    selected,
    isOutsideRoom,
    isOverZone,
}: {
    container: ContainerInRoom;
    selected: boolean;
    isOutsideRoom: boolean;
    isOverZone: boolean;
}) {

    //Load image using useImage hook
    const [img, status] = useImage(
        container.container.imageTopViewUrl, 
    );

    const image = status === "loaded" ? img : null;

    const [lidImg] = useImage(lidIconUrl);


      return (
        <Group>
          {image ? (
            <KonvaImage
              image={image}
              width={container.width}
              height={container.height}
              opacity={isOutsideRoom ? 0.5 : selected ? 0.9 : 1}
              shadowColor={selected ? "#256029" : undefined}
              perfectDrawEnabled={false}
              crossOrigin="anonymous"
            />
          ) : (
            <Rect
              width={container.width}
              height={container.height}
              fill={isOverZone ? "rgba(255,0,0,0.5)" : selected ? "#7fd97f" : "#9df29d"}
              stroke="#256029"
              strokeWidth={2}
              cornerRadius={4}
            />
          )}

          {/* Lock-i-lock indicator */}
          {container.lockILock && lidImg && (
            <KonvaImage
              image={lidImg}
              width={container.width / 1.5}
              height={container.width / 1.5}
              x={container.width - container.width * 0.25}
              y={container.height * 0.05}
            />
          )}

        </Group>

    );
}
