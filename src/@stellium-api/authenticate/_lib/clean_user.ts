/**
 * Returns a user object with protected fields remove
 * e.g. __v, salt, hash
 * Uses `delete obj[property]` instead of splice to completely remove the protected fields
 * @param user
 * @returns {*}
 */
export const CleanUser = (user) => {

    // Removes user's __v from the user object. MongoDB versionKey
    // The versionKey is a property set on each document when first created by Mongoose.
    // This key's value contains the internal revision of the document. The name of this document
    // property is configurable. The default is __v.

    // Removes user's hash from the user object
    // Removes user's salt from the user object
    // Returns the `pristine` user
    return {...user, hash: undefined, salt: undefined, __v: undefined}
}
