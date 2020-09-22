import API_CONFIG from '../api-config';

const getVideoUploadUrl = fileName => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'video.upload') + fileName;
    return apiLink;
};

export default getVideoUploadUrl;
