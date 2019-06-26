//按照对象key字母升序排序
const _keyRiseRank = obj => {
	let newkey = Object.keys(obj).sort();
	let newObj = {};
	for (let i = 0; i < newkey.length; i++) {
		newObj[newkey[i]] = obj[newkey[i]];
	}
	return newObj;
};
//参数排序方法
const _paramsRank = obj => {
	obj = _keyRiseRank(obj);
	let str0 = '';
	for (let i in obj) {
		if (i != 'sign' && i != 'rawData') {
			let str1 = '';
			str1 = i + '=' + obj[i];
			str0 += str1;
		}
	}
	return str0;
};
//取出字符串中所有空格
const _myTrim = str => {
	return str.replace(/\s+/g, '');
};
//签名算法 options 需提交的参数 time 时间戳
const signAlgorithm = (options, time) => {
	let C2 = '';
	let C3 = '';
	let C = _paramsRank(options); //排序后拼接成的字符串C
	let S = time.slice(time.length - 1); //截取time的最后一位为S
	if (C.length < S) {
		S = parseInt(S / 2);
	} else {
		C2 = C.slice(C.length - S); //截取C的后S位
	}
	let I = time.slice(time.length - 2, time.length - 1); // 截取time的倒数第二为I
	if (C.length < I) {
		I = parseInt(I / 2);
	} else {
		let arr = C.split('');
		arr.splice(I, 0, C2);
		C3 = arr.join('');
	}
	return _myTrim(C3);
};

module.exports = signAlgorithm;
