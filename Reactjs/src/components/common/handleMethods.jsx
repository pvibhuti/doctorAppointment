import { get } from "../../security/axios";

export const fetchData = async (url, setter) => {
    await get(url)
        .then((res) => {
            setter(res.data)
        })
        .catch((err) => {
            console.error(err);
        })
}