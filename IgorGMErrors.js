/** 
 * A syntax error encountered by the GMS2 compiler.
 */
export const GMS2SyntaxError = {
	regex: /^Error : (?<scriptString>gml_[a-zA-Z_][a-zA-Z0-9_]*)\((?<lineNumber>[0-9]+)\) : (?<message>.+)$/m
};

/** 
 * A generic error in compiling, such as a syntax error.
 */
export const JobCompilationError = {
	/**
	 * Capture a compile-time error in the format:
	 * ```
	 * Error : some error
	 * ```
	 */
	regex: /^Error : (?<error>.+)/m
}


/**
 * An error Igor encountered due to system file permissions, or execution permissions.
 * 
 * This is a rare one to see, so it's a bit difficult to document what format to expect
 * it in bar one or two times I have seen it personally.
 * 
 */
export const JobPermissionsError = {
	/**
	 * Capture a compile-time error in the format:
	 * ```
	 * Permission Error : some error
	 * ```
	 */
	regex: /^Permission Error : (?<error>.+)/m
};

/** 
 * An error that occurred at runtime.
 */
export const GMS2RuntimeError = {
	/**
	 * Some silly regex that captures an error in either the 2024.400<= or 2024.600+ format, since
	 * they randomly changed it ever-so-slightly.
	 */
	regex: /^ERROR!!! :: #+\nERROR in\saction number 1\sof (?<event>[A-Za-z0-9 ]+?)\sfor object (?<object>\S+?):\n+(?<exception>[\s\S]+?)(\n at [^\n]+)?\n#+\n(?<stackTrace>(?:gml_.+?\n)+)/m
};
