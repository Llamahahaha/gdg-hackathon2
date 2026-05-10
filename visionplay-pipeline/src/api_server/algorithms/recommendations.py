def get_recommendations(entropy, diameter):
    """
    Rule-based tactical recommendations derived from graph metrics.

    Args:
        entropy (float): Formation entropy (0–1). High = disordered.
        diameter (int): Graph diameter (longest shortest path). High = spread team.

    Returns:
        list[str]: List of actionable tactical suggestions.
    """
    recs = []

    if entropy > 0.7:
        recs.append("High instability — compress formation")

    if diameter > 100:
        recs.append("Team too spread — reduce gaps")

    if not recs:
        recs.append("Structure stable")

    return recs
