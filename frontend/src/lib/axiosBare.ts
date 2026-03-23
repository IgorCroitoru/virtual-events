import axios from "axios"
import { NEXT_PUBLIC_BACKEND_BASE_API } from "../../config"

const axiosBare = axios.create({
    baseURL: NEXT_PUBLIC_BACKEND_BASE_API + "/api",
    withCredentials: true,
  })

export default axiosBare