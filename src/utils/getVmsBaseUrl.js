const getVmsBaseUrl = (vmsDomain, vmsPort, path) => {
    return `https://${vmsDomain}:${vmsPort}/vms/${path ? path + '/' : ''}`;
};

export default getVmsBaseUrl;
