import numpy as np


def compute_entropy(players):
    """
    Positional entropy: measures how spread out / disordered the team formation is.

    Computes the mean Euclidean distance of each player from the team centroid,
    then normalizes to a 0–1 scale (divide by 50, clip at 1).

    0 = perfectly compact / ordered
    1 = highly spread / chaotic
    """
    if not players:
        return 0.0

    positions = np.array([[p["x"], p["y"]] for p in players])
    center = np.mean(positions, axis=0)

    spread = np.mean(np.linalg.norm(positions - center, axis=1))

    entropy = min(spread / 50, 1.0)  # normalize to 0–1
    return round(float(entropy), 4)
