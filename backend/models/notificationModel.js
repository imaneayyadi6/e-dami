import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = Schema(
    {
        content: {
            type: String,
            required: [true, "veuillez saisir le contenu de la notification"],
        },
        dateNotification: {
            type: Date,
            required: [true, "veuillez saisir la date de la notification"],
            default: new Date()
        },
        vue: {
            type: Boolean,
            required: [true, "veuillez mentionner est ce que la notification a été vue par l'utilisateur ou non "],
            default: false
        },
        vueToast: {
            type: Boolean,
            required: [true, "veuillez mentionner est ce que la notification a été vue par l'utilisateur ou non (Toast)"],
            default: false
        },
        utilisateur: {
            type: Schema.Types.ObjectId,
            required: [true, "veuillez saisire l'utilisateur"],
            ref: "utilisateur",
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("notification", notificationSchema);
export default Notification;
