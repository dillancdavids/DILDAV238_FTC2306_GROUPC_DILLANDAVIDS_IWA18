/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */

import { TABLES, COLUMNS, state, createOrderData,updateDragging } from "./data.js";
import { createOrderHtml, html, updateDraggingHtml, moveToColumn } from "./view.js";


const handleDragStart = (event) => {
    const orderId = event.target.dataset.id;
    event.dataTransfer.setData('text/plain', orderId);
}

const handleDragEnd = (event) => {
    updateDragging({ source: null });
    updateDraggingHtml({ over: null });
}

const handleHelpToggle = () => {
    html.help.overlay.showModal();
}

const handleAddToggle = () => {
    html.add.overlay.showModal();
    html.add.title.value = ''; // Clear the input field
    html.add.table.value = TABLES[0]; // Set the default table value
}

const handleAddSubmit = (event) => {
    event.preventDefault();
    const title = html.add.title.value;
    const table = html.add.table.value;
    
    if (title && table) {
        const newOrder = createOrderData({ title, table, column: COLUMNS[0] });
        state.orders[newOrder.id] = newOrder;
        const orderHtml = createOrderHtml(newOrder);
        html.columns[COLUMNS[0]].appendChild(orderHtml);
        html.add.overlay.close();
    }
}

const handleEditToggle = (event) => {
    const orderId = event.target.dataset.id;
    const order = state.orders[orderId];
    
    if (order) {
        html.edit.id.value = orderId;
        html.edit.title.value = order.title;
        html.edit.table.value = order.table;
        html.edit.column.value = order.column;
        html.edit.overlay.showModal();
    }
}

const handleEditSubmit = (event) => {
    event.preventDefault();
    const orderId = html.edit.id.value;
    const order = state.orders[orderId];
    
    if (order) {
        order.title = html.edit.title.value;
        order.table = html.edit.table.value;
        const newColumn = html.edit.column.value;
        moveToColumn(orderId, newColumn);
        order.column = newColumn;
        html.edit.overlay.close();
    }
}

const handleDelete = (event) => {
    const orderId = html.edit.id.value;
    delete state.orders[orderId];
    const orderHtml = document.querySelector(`[data-id="${orderId}"]`);
    if (orderHtml) {
        orderHtml.remove();
    }
    html.edit.overlay.close();
}

html.add.cancel.addEventListener('click', handleAddToggle);
html.other.add.addEventListener('click', handleAddToggle);
html.add.form.addEventListener('submit', handleAddSubmit);

html.other.grid.addEventListener('click', handleEditToggle);
html.edit.cancel.addEventListener('click', handleEditToggle);
html.edit.form.addEventListener('submit', handleEditSubmit);
html.edit.delete.addEventListener('click', handleDelete);

html.help.cancel.addEventListener('click', () => html.help.overlay.close());
html.other.help.addEventListener('click', handleHelpToggle);

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart);
    htmlColumn.addEventListener('dragend', handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver);
}

