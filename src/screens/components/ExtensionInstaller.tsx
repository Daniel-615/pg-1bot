import { useQuery } from "@tanstack/react-query";
import { Check, Download, Puzzle, X } from "lucide-react";
import { getExtensionBlocks, getExtensions, type Extension, type ExtensionBlockDefinition } from "../../services/extensions.service";
import "../../styles/ExtensionInstaller.css";

type ExtensionInstallerProps = {
  board: string;
  installedExtensionIds: string[];
  onInstall: (extensionId: string) => void;
  onClose: () => void;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getBoardNames(extension: Extension, blocks: ExtensionBlockDefinition[], board: string) {
  const names = blocks
    .filter((block) => block.extension?.id_extension === extension.id_extension)
    .flatMap((block) => block.placas?.map((plate) => plate.nombre ?? "") ?? [])
    .filter(Boolean);
  const currentBoard = normalize(board);
  const compatible = names.filter((name) => normalize(name).includes(currentBoard) || currentBoard.includes(normalize(name)));
  return [...new Set(compatible.length ? compatible : names)];
}

function hasBlocksForBoard(extension: Extension, blocks: ExtensionBlockDefinition[], board: string) {
  const currentBoard = normalize(board);
  return blocks.some((block) => {
    if (block.extension?.id_extension !== extension.id_extension) return false;
    return !block.placas?.length || block.placas.some((plate) => {
      const name = normalize(plate.nombre ?? "");
      if (!name) return false;
      return name.includes(currentBoard) || currentBoard.includes(name);
    });
  });
}

export function ExtensionInstaller({ board, installedExtensionIds, onInstall, onClose }: ExtensionInstallerProps) {
  const extensionsQuery = useQuery({ queryKey: ["extensions", "installer"], queryFn: getExtensions, staleTime: 300000 });
  const blocksQuery = useQuery({ queryKey: ["extensionBlocks", "installer"], queryFn: getExtensionBlocks, staleTime: 300000 });
  const extensions = extensionsQuery.data ?? [];
  const blocks = blocksQuery.data ?? [];

  return (
    <section className="extension-installer" aria-label="Instalar una extensión">
      <div className="extension-installer-header">
        <div className="extension-installer-title">
          <span className="extension-installer-icon"><Puzzle size={17} /></span>
          <div><strong>Extensiones</strong><small>Placa activa: {board}</small></div>
        </div>
        <button className="extension-installer-close" type="button" aria-label="Cerrar extensiones" title="Cerrar extensiones" onClick={onClose}>
          <X size={17} />
        </button>
      </div>

      <div className="extension-installer-list">
        {extensionsQuery.isLoading && <p className="extension-installer-state">Cargando extensiones...</p>}
        {extensionsQuery.isError && <p className="extension-installer-state">No se pudieron cargar las extensiones.</p>}
        {!extensionsQuery.isLoading && !extensions.length && <p className="extension-installer-state">No hay extensiones disponibles.</p>}
        {extensions.map((extension) => {
          const installed = installedExtensionIds.includes(extension.id_extension);
          const boardNames = getBoardNames(extension, blocks, board);
          const compatible = hasBlocksForBoard(extension, blocks, board);
          return (
            <article className={`extension-card ${installed ? "installed" : ""}`} key={extension.id_extension}>
              <div className="extension-card-copy">
                <div className="extension-card-name"><strong>{extension.nombre}</strong><span>v{extension.version}</span></div>
                <p>{extension.descripcion || "Bloques para ampliar tu proyecto."}</p>
                <small>{compatible ? `Compatible con: ${boardNames.join(", ") || board}` : "Sin bloques para esta placa"}</small>
              </div>
              <button
                className="extension-install-button"
                type="button"
                disabled={!compatible && !installed}
                onClick={() => onInstall(extension.id_extension)}
              >
                {installed ? <><Check size={15} /> Instalada</> : <><Download size={15} /> Instalar</>}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
