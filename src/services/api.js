import API_CONFIG from '../api-config';
import axios from 'axios/index';
import CONSTANTS from '../constants';

axios.defaults.headers.common['Content-Type'] = 'application/json';

const apiService = {
    getApiEndPoint(url, params, type = CONSTANTS.ENDPOINT_SERVICE.API) {
        let apiLink = '';
        if (url.indexOf('http') > -1) {
            apiLink = url;
        } else {
            apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, url);
        }

        const requestParams = params;
        if (_.get(requestParams, 'endpointSubfix')) {
            apiLink += requestParams.endpointSubfix;
            delete requestParams.endpointSubfix;
        }

        if (!_.isNil(_.get(params, 'id'))) {
            if (apiLink.indexOf(':id') > -1) {
                apiLink = apiLink.replace(/:id/g, requestParams.id);
            }
        }

        return { apiLink, requestParams };
    },
    get(url, params, type = CONSTANTS.ENDPOINT_SERVICE.API) {
        const { apiLink, requestParams } = this.getApiEndPoint(url, params, type);
        return axios
            .get(apiLink, {
                params: requestParams
            })
            .then(response => response.data);
    },
    post(url, params, type = CONSTANTS.ENDPOINT_SERVICE.API) {
        const { apiLink, requestParams } = this.getApiEndPoint(url, params, type);
        return axios.post(apiLink, requestParams).then(response => response.data);
    },
    put(url, params, type = CONSTANTS.ENDPOINT_SERVICE.API) {
        const { apiLink, requestParams } = this.getApiEndPoint(url, params, type);
        return axios.put(apiLink, requestParams).then(response => response.data);
    },
    delete(url, params, type = CONSTANTS.ENDPOINT_SERVICE.API) {
        const { apiLink, requestParams } = this.getApiEndPoint(url, params, type);
        return axios.delete(apiLink, requestParams).then(response => response.data);
    }
};

export default apiService;
