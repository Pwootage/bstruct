module.exports = function _v(type, members) {
    return function _vp(arr) {
        let res = {};
        res['type'] = type;
        if (members.length != arr.length) {
            console.error(arr, members);
            throw Error('Number of members must match array size');
        }
        for (let i = 0; i < members.length; i++) {
            let v = members[i];
            if (v && v[0] != '_') {
                res[v] = arr[i];
            }
        }
        return res;
    };
}