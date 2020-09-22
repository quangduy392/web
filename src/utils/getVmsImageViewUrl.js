const getVmsImageViewUrl = (localVmsUrl, vmsBaseUrl) => {
    return localVmsUrl.replace(
        /http(s*):\/\/\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b:\d+\/vms\//,
        vmsBaseUrl
    );
};

export default getVmsImageViewUrl;