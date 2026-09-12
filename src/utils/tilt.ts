export type Vector3 = { x: number; y: number; z: number };

/**
 * How far the screen is nodded away from vertical, in degrees: positive when
 * the top of the screen tips down toward the floor, negative when it tips up.
 * 0 is the screen standing vertical, which is roughly how it sits against a
 * player's forehead.
 *
 * Read from gravity's component along the device's Z axis — the screen normal
 * — because that is the one axis that does NOT move when the phone is turned
 * between portrait and landscape. Euler angles (`rotation.beta` / `gamma`)
 * are pinned to the phone's short and long edges, so they swap meaning on the
 * flip to landscape and silently stop tracking the nod.
 */
export function screenNodDegrees({ x, y, z }: Vector3): number {
  // atan2 against the in-plane magnitude bounds this to [-90, 90] and keeps it
  // well conditioned near vertical, which is where the player actually holds
  // the phone. Taking a ratio also makes it unit-agnostic: m/s² or g both work.
  const inPlane = Math.hypot(x, y);
  const elevation = Math.atan2(z, inPlane);
  // +z means the screen faces the sky; a downward nod is the "correct"
  // gesture, so flip the sign to make down positive.
  return (-elevation * 180) / Math.PI;
}
