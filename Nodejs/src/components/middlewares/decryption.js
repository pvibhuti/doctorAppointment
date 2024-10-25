const { decryptedDataResponse } = require("../Utils/decryptData");

const decryptionProcess = async (req, res, next) => {
    try {
        const { mac, value } = req.body;
        console.log("MAC and VAlue ", req.body);
        
        const decrypt = await decryptedDataResponse(mac, value);
        console.log("req.body decryption:", decrypt);

        req.body = decrypt;
        console.log("req.body after decryption:", req.body);
        // res.send(decrypt);
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: "Data not encrypted properly.", error: error.message });
    }
};

module.exports = decryptionProcess;