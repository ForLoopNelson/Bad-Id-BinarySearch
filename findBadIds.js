const invalidIds = new Set([1,3])
const jobIds = [1,2,3,4,5,6,7,8,9,10]

// Mimics API rejecting entire batch if one ID is bad
function isBatchValid(ids) {
    return !ids.some(id => invalidIds.has(id)) //returns false if bad ID is present
}

function findInvalidIDs(ids) {
    // If no ID's provided, return nothing
    if (ids.length === 0) return []

    if (ids.length === 1) {
        return isBatchValid(ids) ? [] : ids
    }


    const mid = Math.floor(ids.length / 2)
    const left = ids.slice(0,mid)
    const right = ids.slice(mid)

    return findInvalidIDs(left).concat(findInvalidIDs(right))
}

console.log("Invalid Id's: ",findInvalidIDs(jobIds))