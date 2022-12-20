import styles from "../styles/FloatingButton.module.scss"

type FloatingButtonProp = {
    text?: String,
    link?: String,
    top?: String,
    bottom?: String,
    left?: String,
    right?: String,
    background?: String,
    borderRadius?: String,
    className?: String
}

export default function FloatingButton({ text = "Floating button", link, top = "initial", bottom = "initial", left = "initial", right = "initial", background = "#14948a", borderRadius = "50px", className = "classname" }: FloatingButtonProp) {
    return (
        <button className={`${className} ${styles.floatingbtn}`} style={{
            position: "fixed",
            top: `${top}`,
            bottom: `${bottom}`,
            left: `${left}`,
            right: `${right}`,
            background: `${background}`,
            borderRadius: `${borderRadius}`,
            border: 0,
            padding: "9px 20px"
        }} onClick={() => window.open(`${link}`, "_blank")}>
            {text}
        </button>
    )
}