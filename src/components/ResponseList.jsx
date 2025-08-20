import { motion } from "framer-motion";

const ResponseList = ({ responses }) => {
  return (
    <div>
      {responses.map((res, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="text-2xl font-bold text-white bg-blue-500 rounded-lg px-4 py-2 m-2 shadow-md"
        >
          {res.respuesta} - {res.calificacion}
        </motion.p>
      ))}
    </div>
  );
};

export default ResponseList;