
const BAIDU_MAP_GEOCODE_URL = 'http://api.map.baidu.com/geocoding/v3/';

const BAIDU_MAP_AK = '4XKEIDotsgnlSDDj7FvnKJF6yaC8GvXk';

/**
 * 将地址文本转换为经纬度坐标
 * @param {string} address - 要转换的地址
 * @returns {Promise<object|null>} - 包含经纬度的对象 { lat, lng } 或 null
 */
const geocodeAddress = async (address) => {
    if (!address) return null;

    const url = `${BAIDU_MAP_GEOCODE_URL}?address=${encodeURIComponent(address)}&output=json&ak=${BAIDU_MAP_AK}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 0 && data.result) {
            const { lat, lng } = data.result.location;
            return { lat, lng };
        } else {
            console.warn(`Geocoding failed for address: "${address}". Status: ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error during geocoding for address: "${address}"`, error);
        return null;
    }
};

module.exports = { geocodeAddress };
