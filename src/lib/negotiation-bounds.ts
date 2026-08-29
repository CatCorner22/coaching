/**
 * How many negotiated limits can exist, in one dependency-free place.
 *
 * This lives on its own because two very different things need it and neither
 * should import the other: the browser store that holds the rows, and the
 * server function whose request schema has to accept all of them.
 *
 * It exists at all because a literal in each place had already gone wrong
 * twice. The store's row ceiling was a bare `40`, sized when the starter list
 * held 22 rows. The analyze request's `hardNos` cap was a bare `24`, sized the
 * same way. Growing the list to 40 rows broke the second one in production —
 * every non-yes limit is sent as a hard no, so a fresh install with everything
 * at its default of no produced 40 entries against a cap of 24, and the whole
 * analyze request failed schema validation before it went anywhere.
 *
 * That failure mode is the reason this is a shared constant rather than a
 * bigger number: a cap that silently truncates the hard-no list would be worse
 * than one that rejects, because the model would then be told about fewer
 * limits than were actually set, with nothing to say so.
 */

/** Ceiling on stored negotiation rows, custom additions included. */
export const MAX_NEGOTIATION_ITEMS = 64;

/**
 * Ceiling on `hardNos` in an analyze request.
 *
 * Every row that is not a yes is sent, so this must accommodate the whole list
 * being at no — which is exactly what a fresh install looks like.
 */
export const MAX_HARD_NOS = MAX_NEGOTIATION_ITEMS;

/**
 * Ceiling on one hard-no line, shared by the client that builds
 * `"<id>: <label>"` and the server schema that admits it. Normalization
 * clamps BOTH ids and labels to 80 (a persisted or imported custom row can
 * carry an 80-char id, not just a 36-char UUID), so the longest legitimate
 * line is 80 + 2 + 80 = 162. Anything shorter truncates consent text: the
 * first revision of this bound (120) assumed UUID ids and could silently
 * drop the decisive tail of a long custom hard-no; the cap of 80 before it
 * rejected the client's own construction outright, stranding the one-use
 * batch as "already submitted" with nothing sent.
 */
export const MAX_HARD_NO_LENGTH = 164;
