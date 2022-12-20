type MultiColorTextProps = {
    textOne: String,
    textTwo: String,
    colorOne: String,
    colorTwo: String,
    fontSize: String
}

export default function MultiColorText({ textOne, textTwo, colorOne, colorTwo, fontSize = "20px" }: MultiColorTextProps) {
    return (
        <div style={{ display: "flex", gap: "9px", fontSize: `${fontSize}` }}>
            <h4 style={{ color: `${colorOne}` }}>{textOne}</h4>
            <h4 style={{ color: `${colorTwo}` }}>{textTwo}</h4>
        </div>
    )
}