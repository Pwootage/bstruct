import { ASTInt } from "./ASTInt";
import { ASTIdentifier } from "./ASTIdentifier";

export type ASTTemplatableInt = ASTInt | ASTIdentifier;